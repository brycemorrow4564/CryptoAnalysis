import csv
import json
import re
import datetime
import os
import lxml.html

from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By

import settings

'''DRIVER UTILITY FUNCTIONS'''

#Will keep looping until the page eventually loads 
def ensure_page_loaded():
    while True: 
        currUrl = settings.driver.current_url
        lookForStr = 'start' #on page load, 'start' is embedded in url so we look for that 
        if lookForStr in currUrl: 
            break 

'''DATA SCRAPING'''

#Returns list of row objects (or dicts)
def scrape_rows(fieldnames):
    tableClass = 'table'
    table = settings.driver.find_element_by_class_name(tableClass)
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

def write_to_csv(rowObjects, fieldnames, csvDirRoot, coinName): 
    csvfile = open(csvDirRoot + coinName + '.csv', 'w')
    writer = csv.DictWriter(csvfile, extrasaction='ignore', fieldnames=fieldnames)
    writer.writeheader()
    for obj in rowObjects:
        writer.writerow(obj)
    csvfile.close()

def write_to_json(jsonDirRoot, csvDirRoot, fieldnames, coinName): 
    csvfile = open(csvDirRoot + coinName + '.csv', 'r')
    jsonfile = open(str(jsonDirRoot + coinName + '.json'), 'w')
    reader = [row for row in csv.DictReader(csvfile, fieldnames)]
    numRows = len(reader)
    jsonfile.write('[\n')
    for i in xrange(numRows): 
        row = reader[i]
        json.dump(row, jsonfile)
        jsonfile.write(',\n' if i != numRows - 1 else '\n')
    jsonfile.write(']')
    jsonfile.close()

def check_crypto_dirs(top100Coins):
    csvs = [file.replace('.csv','') for file in os.listdir('CryptoCSV')]
    jsons = csvs = [file.replace('.json','') for file in os.listdir('CryptoJSON')]
    indicesToKeep = list()
    for i in xrange(len(top100Coins)): 
        if top100Coins[i] not in jsons or top100Coins[i] not in csvs:
            indicesToKeep.append(i)
    return [top100Coins[x] for x in indicesToKeep], [settings.main_page_url + 'currencies/' + top100Coins[x] + '/historical-data/' for x in indicesToKeep]


'''MAIN LOGIC FUNCTIONS'''
    
def run_data_scraper():
    top100Coins = get_top_100_coin_names()
    coinNames, urls = check_crypto_dirs(top100Coins)
    for i in xrange(len(coinNames)):
        #Navigate to page where the data is for this particular coin 
        coinName = coinNames[i]
        url = urls[i]
        settings.driver.get(url)
        dropdownClass = 'reportrange'
        dropdown = settings.driver.find_element_by_id(dropdownClass)
        dropdown.location_once_scrolled_into_view
        dropdown.click()
        #Dropdown is jquery action loading html into the dom that always happens fast regardless of latency. 
        #The html is weird and there's no other way to check for it so an implicit wait of .4 seconds should work here 
        settings.driver.implicitly_wait(.3)
        dropdownMenuClass = 'ranges'
        dropdownMenu = settings.driver.find_element_by_class_name(dropdownMenuClass)
        dropdownMenu.location_once_scrolled_into_view
        dropdownItems = dropdownMenu.find_elements_by_tag_name('li')
        targetItemText = 'All Time'
        for item in dropdownItems: 
            if item.text == targetItemText: 
                item.click()
                ensure_page_loaded()
                break 
        settings.driver.implicitly_wait(.6)
        #Scrape data 
        fieldnames = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Market Cap']
        rowObjects = scrape_rows(fieldnames)
        #Write to csv 
        csvDirRoot = 'CryptoCSV/'
        write_to_csv(rowObjects, fieldnames, csvDirRoot, coinName)
        #Create json from previously created csv 
        jsonDirRoot = 'CryptoJSON/'
        write_to_json(jsonDirRoot, csvDirRoot, fieldnames, coinName)

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