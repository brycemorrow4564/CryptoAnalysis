from selenium import webdriver

import datetime

class Globals: 

    def __init__(self): 
        self.main_page_url = 'https://coinmarketcap.com/currencies/'
        self.driver = driver_setup(self.main_page_url)
        self.queryString = '?start=20130428&end=' #Querystring based on earliest possible start date.

#General driver and executable path setup 
def driver_setup(url):
    driver = webdriver.PhantomJS()
    driver.get(url)
    driver.set_window_size(1300, 900)
    return driver

def setup():
    g = Globals()
    #generate query string to indicate time period of interest
    currDate = datetime.datetime.now()
    year = str(currDate.year)
    month = str(currDate.month) 
    month = month if len(month) == 2 else '0' + month
    day = str(currDate.day)
    day = day if len(day) == 2 else '0' + day
    queryStringEnd = year + month + day
    #update field in object container
    g.queryString += queryStringEnd
    return g 


    