import csv
import json
import time
import re
import datetime
import os
import lxml.html
import shutil
import locale

from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By

import settings

'''HACKY DRIVER UTILITY FUNCTIONS (BECAUSE SELENIUM SUCKS !!!)'''

def close_and_reset_driver(url):
    settings.driver.close()
    settings.driver = settings.driver_setup(url)

def verify_query_string_url():
    return settings.queryString in settings.driver.current_url


def driver_get_page_timeout_wrapper(url):
    while True: 
        try: 
            settings.driver.get(url)
            break 
        except: 
            print "30 sec timeout"
            #Case of 30s timeout so severe network issues. It's best to close driver and reopen window
            close_and_reset_driver(url)

'''DATA SCRAPING'''

#Returns list of row objects (or dicts)
def scrape_rows(fieldnames):
    tableClass = 'table'
    table = None 
    counter = 0
    while True: 
        try: 
            table = settings.driver.find_element_by_class_name(tableClass)
            print "found table " + settings.driver.current_url
            break 
        except: 
            print "unable to locate table on page " + settings.driver.current_url
            pass
    tbody = table.find_element_by_tag_name('tbody')
    thtml = str('<table><tbody>' + tbody.get_attribute('innerHTML') + '</tbody></table>').strip()
    root = lxml.html.fromstring(thtml)
    xpathOne = 'tbody/tr'
    rows = root.xpath(xpathOne)
    rowObjects = list()
    for row in rows:
        cellVals = [c.text for c in row.getchildren()]
        rowObjects.append({key: val for key, val in zip(fieldnames, cellVals)})
    return rowObjects

#Get names of all coins in top 100 and the urls where their historical data is stored
def get_top_100_coin_names(): 
    tableId = 'currencies'
    table = settings.driver.find_element_by_id(tableId)
    rows = table.find_elements_by_tag_name('tr')
    coinNames = list()
    for r in rows[1:]: #remove first item from urls since it is header row 
        coinNames.append(r.get_attribute('id')[3:])
    return coinNames

'''DATE UTILITY FUNCTIONS'''

#given name of month returns integer 1-12 
def month_num_from_name(month):
    return {datetime.date(2017, i, 1).strftime('%B').lower():i for i in range(1,13)}[month.lower()]


#'Jun 10, 2017' --> datetime.datetime object 
def parse_date(rawDateData):
    dateRegex = re.compile('([^\s\,]+)')
    datetimeData = [str(elem) for elem in dateRegex.findall(rawDateData)]
    monthName = datetime.datetime.strptime(datetimeData[0], '%b').strftime('%B')
    day = datetimeData[1]
    year = datetimeData[2]
    return datetime.datetime(int(year), month_num_from_name(monthName), int(day))

'''FILE READS AND WRITE (CSV/JSON)'''

def write_to_csv(rowObjects, fieldnames, coinName): 
    csvfile = open(settings.csvDirRoot + coinName + '.csv', 'w')
    writer = csv.DictWriter(csvfile, extrasaction='ignore', fieldnames=fieldnames)
    writer.writeheader()
    for obj in rowObjects:
        for fieldname in fieldnames: 
            try: 
                obj[fieldname] = int(obj[fieldname].replace(',','')) #convert data from string to int if possible else pass 
            except Exception as e:
                pass
        writer.writerow(obj)
    csvfile.close()

def write_to_json(fieldnames, coinName): 
    csvfile = open(settings.csvDirRoot + coinName + '.csv', 'r')
    jsonfile = open(str(settings.jsonDirRoot + coinName + '.json'), 'w')
    reader = [row for row in csv.DictReader(csvfile, fieldnames)][1:]
    numRows = len(reader)
    jsonfile.write('{ "name": ' + '"' + coinName + '",\n "priceHistory": [' )
    for i in xrange(numRows): #eliminate last row which is header row for csv
        row = reader[i]
        for fieldname in fieldnames[1:]:
            try: 
                row[fieldname] = float(row[fieldname]) #this will fail if field should have value but is empty i.e. '-'
            except Exception as e: 
                pass
        try:
            json.dump(row, jsonfile)
        except Exception as e: 
            print "Misclassification of url routing by coinmarketcap"
            jsonfile.close()
            return 
        jsonfile.write(',\n' if i != numRows - 1 else '\n')
    jsonfile.write(']}')
    jsonfile.close()

#Aggregates contents of all json files into one large file (ALLCOINS.json)
def create_aggregate_json(): 
    jsonStr = '{ "Coins": [\n'
    fileNames = os.listdir(settings.jsonDirName)
    numFiles = len(fileNames)
    for i in xrange(numFiles): 
        filename = fileNames[i]
        with open(settings.jsonDirRoot + filename) as jsonFile: 
            jsonObj = json.load(jsonFile)
            jsonStr += json.dumps(jsonObj) + (',\n' if i != numFiles - 1 else '\n')       
    jsonStr += ']}'
    aggrJsonObj = json.loads(jsonStr)
    with open(settings.jsonDirRoot + 'ALLCOINS.json', 'w') as aggregateFile: 
        json.dump(aggrJsonObj, aggregateFile)
        aggregateFile.close()

'''DATA DIRECTORY MANAGEMENT'''

def clear_crypto_dirs():
    shutil.rmtree(settings.csvDirRoot)
    shutil.rmtree(settings.jsonDirRoot)
    os.mkdir(settings.csvDirName)
    os.mkdir(settings.jsonDirName)

'''MAIN LOGIC FUNCTIONS'''

'''
Since almost all of the exeuction time of the program is the navigating between pages and waiting for pages to load, 
compared to extremely fast html parsing operations for the formatting and storage (csv, json) of data, I made the 
design choice to have the program start from scratch with each iteration, rather than trying to simply append data
to preexisting files. 
'''
    
def run_data_scraper():
    clear_crypto_dirs() #clear all previous data from csv and json dirs 
    top100Coins = get_top_100_coin_names()
    coinNames = top100Coins
    urls = [settings.main_page_url + coinName + '/historical-data/' + settings.queryString for coinName in top100Coins]
    #coinRank = {coinNames[i]: i+1 for i in xrange(len(coinNames))}
    for i in xrange(len(coinNames)):
        coinName = coinNames[i]
        url = urls[i]
        driver_get_page_timeout_wrapper(url) #after this you are guaranteed to be on historical data page 
        if not verify_query_string_url(): 
            print "Query string was not found in the url for " + coinName
            continue 
        #Scrape data 
        fieldnames = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Market Cap']
        rowObjects = scrape_rows(fieldnames)
        #Write to csv 
        write_to_csv(rowObjects, fieldnames, coinName)
        #Create json from previously created csv 
        write_to_json(fieldnames, coinName)
    #Create all encompassing file after we have gathered and parsed all data 
    create_aggregate_json()

def main():
    settings.setup()
    try: 
        run_data_scraper()
    except Exception as e: 
        print e.message
    settings.driver.close()

if __name__ == '__main__':
    start_time = time.time()
    main()
    elapsed_time = time.time() - start_time
    print elapsed_time



'''
Things to implement  
1. Find out how to make sure geckodriver process only on a single port 
'''