import json
import time
import re
import datetime

import settings as settings

''' DRIVER UTILITY FUNCTIONS '''


def close_and_reset_driver(url):
    GLOBAL.driver.close()
    GLOBAL.driver = GLOBAL.driver_setup(url)


def verify_query_string_url():
    return GLOBAL.queryString in GLOBAL.driver.current_url


def driver_get_page_timeout_wrapper(url):
    while True:
        try:
            GLOBAL.driver.get(url)
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
            table = GLOBAL.driver.find_element_by_class_name(tableClass)
            print "found table " + GLOBAL.driver.current_url
            break
        except:
            print "unable to locate table on page " + GLOBAL.driver.current_url
            pass
    tbody = table.find_element_by_tag_name('tbody').get_attribute('innerHTML')
    #Heroku not recognizing lxml.html library so quick workaround fix implemented below using regex
    tableRegex = re.compile('<tr.*?>\s*<td.*?>(.*?)</td>\s*<td.*?>(.*?)</td>\s*<td.*?>(.*?)</td>\s*<td.*?>(.*?)</td>\s*<td.*?>(.*?)</td>\s*<td.*?>(.*?)</td>\s*<td.*?>(.*?)</td>\s*</tr>')
    rowObjects = list()
    parsedHtml = tableRegex.findall(tbody)
    for i in range(len(parsedHtml)):
        #This line is a little ugly but it formats data and converts elements of each tuple from unicode to a string
        rowObjects.append({key: val for key, val in zip(fieldnames, list([''.join(elem) for elem in parsedHtml[i]]))})
    return rowObjects

    # --------------------------------------------------------------------------------------------------------
    # Alternative method of parsing html to extract data. Did not use during deploy due to issues with Heroku
    # importing the lxml.html library.
    # --------------------------------------------------------------------------------------------------------
    # thtml = str('<table><tbody>' + tbody.get_attribute('innerHTML') + '</tbody></table>').strip()
    # root = lxml.html.fromstring(thtml)
    # xpathOne = 'tbody/tr'
    # rows = root.xpath(xpathOne)
    # rowObjects = list()
    # for row in rows:
    #     cellVals = [c.text for c in row.getchildren()]
    #     rowObjects.append({key: val for key, val in zip(fieldnames, cellVals)})
    # return rowObjects


#Get names of all coins in top 100 and the urls where their historical data is stored
def get_top_100_coin_names():
    tableId = 'currencies'
    table = GLOBAL.driver.find_element_by_id(tableId)
    rows = table.find_elements_by_tag_name('tr')
    coinNames = list()
    for r in rows[1:]: #remove first item from urls since it is header row of table
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


def run_data_scraper():
    coinNames, agg_coin_data = get_top_100_coin_names(), []
    urls = [GLOBAL.main_page_url + coinName + '/historical-data/' + GLOBAL.queryString for coinName in coinNames]
    for i in range(len(coinNames)):
        driver_get_page_timeout_wrapper(urls[i]) #after this you are guaranteed to be on historical data page
        if not verify_query_string_url():
            print "Query string was not found in the url for " + coinName
            continue
        data = [{k:v for k,v in elem.iteritems() if k not in ['High','Low','Close']} for elem in scrape_rows(['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'MarketCap'])]
        agg_coin_data.append({
            "name": coinNames[i],
            "data": data
        })
    print ("SENTINEL") #marker so we can find index of json object in stdout via nodejs
    print (json.dumps(agg_coin_data)) #wrap via json.dumps so that string is in correct form for parsing by nodejs


def main():
    # ------------------------------------------------------------------------------------------------------
    # SOME QUICK TEST DATA IN CORRECT FORMAT FOR NODEJS
    # ------------------------------------------------------------------------------------------------------
    # print ("SENTINEL");
    # print(json.dumps([{
    #          'name':'oneeee',
    #          'data':[{"Volume": "629", "Date": "Aug 04, 2015", "MarketCap": "74,890", "Open": "0.009419"},
    #                  {"Volume": "630", "Date": "Aug 05, 2015", "MarketCap": "74,899", "Open": "0.009420"}]
    #         },
    #         {
    #          'name':'two',
    #          'data':[{"Volume": "631", "Date": "Aug 04, 2015", "MarketCap": "74,890", "Open": "0.009419"},
    #                  {"Volume": "632", "Date": "Aug 05, 2015", "MarketCap": "74,891", "Open": "0.009422"}]
    #         },
    #         {
    #          'name':'three',
    #          'data':[{"Volume": "633", "Date": "Aug 04, 2015", "MarketCap": "74,890", "Open": "0.009419"},
    #                  {"Volume": "634", "Date": "Aug 05, 2015", "MarketCap": "74,893", "Open": "0.009424"}]
    #         }]))
    global GLOBAL
    GLOBAL = settings.setup()
    run_data_scraper()
    GLOBAL.driver.close()


if __name__ == '__main__':
    main()
