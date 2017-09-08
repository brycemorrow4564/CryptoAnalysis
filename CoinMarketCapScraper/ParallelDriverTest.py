import time
import re
import datetime
import os
import lxml.html
import shutil
import locale
import sys

from selenium import webdriver


'''HACKY DRIVER UTILITY FUNCTIONS (BECAUSE SELENIUM SUCKS !!!)'''

def close_and_reset_driver(url):
    driver.close()
    driver = driver_setup(url)

def verify_query_string_url():
    return queryString in driver.current_url


def driver_get_page_timeout_wrapper(url):
    while True:
        try:
            driver.get(url)
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
            table = driver.find_element_by_class_name(tableClass)
            print "found table " + driver.current_url
            break
        except:
            print "unable to locate table on page " + driver.current_url
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
    table = driver.find_element_by_id(tableId)
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


'''MAIN LOGIC FUNCTIONS'''

#General driver and executable path setup
def driver_setup(url):
    driver = webdriver.PhantomJS()
    driver.get(url)
    #driver.set_window_size(1300, 900)
    return driver

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
    urls = [main_page_url + coinName + '/historical-data/' + queryString for coinName in top100Coins]
    writeObjects = []
    #Gather data from web
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
        writeObjects.append({
            "rowObjects": rowObjects,
            "fieldNames": fieldnames,
            "coinName"  : coinName
        })
    #Write to files
    for obj in writeObjects:
        write_to_csv(obj['rowObjects'], obj['fieldNames'], obj['coinName'])
        write_to_json(obj['fieldNames'], obj['coinName'])
    #Pass aggregate json object to nodejs server
    aggJson = create_aggregate_json()
    print (aggJson)
    sys.stdout.flush() #Flushes buffer and data is received via nodejs python-shell

def main():
    run_data_scraper()

if __name__ == '__main__':
    #setup globals
    global main_page_url, csvDirRoot, csvDirName, jsonDirRoot, jsonDirName, queryString
    main_page_url = 'https://coinmarketcap.com/currencies/'
    csvDirRoot = './WebApp/CryptoCSV/'
    csvDirName = 'CryptoCSV'
    jsonDirRoot = './WebApp/CryptoJSON/'
    jsonDirName = 'CryptoJSON'
    queryString = '?start=20130428&end='
    #We will try between 1 and 10 drivers running in parallel to determine which is optimal configuration for this task
    for num_drivers in xrange(10): #try up to 10 drivers running in parallel
        pass
    main()




