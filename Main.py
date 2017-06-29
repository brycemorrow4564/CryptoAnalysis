import csv
import json
import re
import datetime
import os
import lxml.html
import shutil

from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By

import settings

'''DRIVER UTILITY FUNCTIONS'''

#Will keep looping until the page eventually loads 
def ensure_page_loaded():
    currUrl = settings.driver.current_url
    lookForStr = 'start' #on page load, 'start' is embedded in url so we look for that 
    if lookForStr in currUrl: 
        return 
    else: 
        driver_get_page_timeout_wrapper(currUrl)

def driver_get_page_timeout_wrapper(url):
    while True: 
        try: 
            settings.driver.get(url)
            break 
        except: 
            pass

'''DATA SCRAPING'''

#Returns list of row objects (or dicts)
def scrape_rows(fieldnames):
    tableClass = 'table'
    table = None 
    counter = 0
    while True: 
        try: 
            table = settings.driver.find_element_by_class_name(tableClass)
            break 
        except: 
            counter += 1
            if counter == 200: 
                raise "Got stuck in infinite loop looking for table for some reason"
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
        writer.writerow(obj)
    csvfile.close()

def write_to_json(fieldnames, coinName): 
    csvfile = open(settings.csvDirRoot + coinName + '.csv', 'r')
    jsonfile = open(str(settings.jsonDirRoot + coinName + '.json'), 'w')
    reader = [row for row in csv.DictReader(csvfile, fieldnames)]
    numRows = len(reader)
    jsonfile.write('[\n')
    for i in xrange(numRows): 
        row = reader[i]
        json.dump(row, jsonfile)
        jsonfile.write(',\n' if i != numRows - 1 else '\n')
    jsonfile.write(']')
    jsonfile.close()

'''DATA DIRECTORY MANAGEMENT'''

def check_crypto_dirs(top100Coins):
    csvs = [file.replace('.csv','') for file in os.listdir('CryptoCSV')]
    jsons = csvs = [file.replace('.json','') for file in os.listdir('CryptoJSON')]
    indicesToKeep = list()
    for i in xrange(len(top100Coins)): 
        if top100Coins[i] not in jsons or top100Coins[i] not in csvs:
            indicesToKeep.append(i)
    return [top100Coins[x] for x in indicesToKeep], [settings.main_page_url + 'currencies/' + top100Coins[x] + '/historical-data/' for x in indicesToKeep]


def remove_non_top_100_coin_data(top100coins):
    csvs = [file.replace('.csv','') for file in os.listdir('CryptoCSV')]
    jsons = csvs = [file.replace('.json','') for file in os.listdir('CryptoJSON')]
    for csvCoinName in csvs:
        if csvCoinName not in top100coins: 
            os.remove(settings.csvDirRoot + csvCoinName + '.csv')
    for jsonCoinName in jsons:
        if jsonCoinName not in top100coins: 
            os.remove(settings.jsonDirRoot + jsonCoinName + '.json')

def clear_crypto_dirs():
    shutil.rmtree(settings.csvDirRoot)
    shutil.rmtree(settings.jsonDirRoot)
    os.mkdir(settings.csvDirRoot[:-1])
    os.mkdir(settings.jsonDirRoot[:-1])

'''MAIN LOGIC FUNCTIONS'''
    
def run_data_scraper():
    top100Coins = get_top_100_coin_names()
    coinNames = None
    urls = None 
    #Take processing mode dependent actions 
    if settings.mode == 'FromScratch':
        coinNames = top100Coins
        urls = [settings.main_page_url + 'currencies/' + coinName + '/historical-data/' for coinName in top100Coins]
        clear_crypto_dirs()
    elif settings.mode == 'Update':
        remove_non_top_100_coin_data(top100coins)
        coinNames, urls = check_crypto_dirs(top100Coins) #rework this function
    else: 
        raise 'Invalid processing mode in settings.py'
    for i in xrange(len(coinNames)):
        #Navigate to page where the data is for this particular coin 
        coinName = coinNames[i]
        url = urls[i]
        driver_get_page_timeout_wrapper(url)
        dropdownClass = 'reportrange'
        dropdown = settings.driver.find_element_by_id(dropdownClass)
        dropdown.location_once_scrolled_into_view
        settings.driver.implicitly_wait(.2)
        dropdown.click()
        #Dropdown is jquery action loading html into the dom that always happens fast regardless of latency. 
        #The html is weird and there's no other way to check for it so an implicit wait of .4 seconds should work here 
        settings.driver.implicitly_wait(.3)
        dropdownMenuClass = 'ranges'
        dropdownMenu = settings.driver.find_element_by_class_name(dropdownMenuClass)
        dropdownMenu.location_once_scrolled_into_view
        settings.driver.implicitly_wait(.2)
        dropdownItems = dropdownMenu.find_elements_by_tag_name('li')
        targetItemText = 'All Time'
        for item in dropdownItems: 
            if item.text == targetItemText: 
                item.click()
                ensure_page_loaded()
                break 
        settings.driver.implicitly_wait(.3)
        #Scrape data 
        fieldnames = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Market Cap']
        rowObjects = scrape_rows(fieldnames)
        #Write to csv 
        write_to_csv(rowObjects, fieldnames, coinName)
        #Create json from previously created csv 
        write_to_json(fieldnames, coinName)

def main():
    settings.setup() #globals are driver, main_page_url
    run_data_scraper()

if __name__ == '__main__':
    main()



'''
Things to implement 
1. Configuration file for different modes (updates vs completely new)
2. Check directories for info on any coins that are no longer top100 and remove 
3. Find out how to make sure geckodriver process only on a single port 
4. Create a web project and load this data into the project dynamically
5. Provide basic links for downloads
'''