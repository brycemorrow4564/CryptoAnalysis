from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait

import datetime
import requests

#General driver and executable path setup 
def driver_setup(url): 
    '''
    gecko_path = '/Users/brycemorrow/Documents/Projects/cubeBooker2.0/geckodriver' #path to geckodriver.exe for firefox
    driver = webdriver.Firefox(executable_path=gecko_path)
    driver.get(url)
    driver.set_window_size(1300, 900)
    return driver
    '''
    driver = webdriver.PhantomJS()
    driver.get(url)
    driver.set_window_size(1300, 900)
    return driver

def setup(): 
    global driver, main_page_url, mode, csvDirRoot, jsonDirRoot, csvDirName, jsonDirName, queryString
    #Set values of global variables
    main_page_url = 'https://coinmarketcap.com/currencies/'
    driver = driver_setup(main_page_url)
    csvDirRoot = 'CryptoCSV/'
    csvDirName = 'CryptoCSV'
    jsonDirRoot = 'CryptoJSON/'
    jsonDirName = 'CryptoJSON'
    queryString = '?start=20130428&end='
    #generate query string to indicate time period of interest 
    currDate = datetime.datetime.now()
    year = str(currDate.year)
    month = str(currDate.month) 
    month = month if len(month) == 2 else '0' + month
    day = str(currDate.day)
    day = day if len(day) == 2 else '0' + day
    queryString += year + month + day

    '''
    resp = requests.get(main_page_url)
    if resp.ok:
        print (resp.text)
    else:
        print ("Boo! {}".format(resp.status_code))
        print (resp.text)
    exit()
    '''


    