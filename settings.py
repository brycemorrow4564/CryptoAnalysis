from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait

#General driver and executable path setup 
def driver_setup(): 
    gecko_path = '/Users/brycemorrow/Documents/Projects/cubeBooker2.0/geckodriver' #path to geckodriver.exe for firefox
    driver = webdriver.Firefox(executable_path=gecko_path)
    driver.get(main_page_url)
    driver.set_window_size(1300, 900)
    return driver

def setup(): 
    global driver, main_page_url, mode, csvDirRoot, jsonDirRoot
    #Set values of global variables
    main_page_url = 'https://coinmarketcap.com/'
    driver = driver_setup()
    '''
    FromScratch Mode: clear CryptoCSV/JSON dirs and start from scratch
    Update Mode: remove non-top 100 coins from cryptoCSV/JSON dirs. Take data
                 from previously created files and append only new data
    '''
    mode = 'FromScratch' #can either be 'Update' or 'FromScratch'
    csvDirRoot = 'CryptoCSV/'
    jsonDirRoot = 'CryptoJSON/'