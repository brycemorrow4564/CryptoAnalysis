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
    global driver, main_page_url, timeout_delay, wait
    #Set values of global variables
    main_page_url = 'https://coinmarketcap.com/'
    driver = driver_setup()