import requests
import json

def get_database():
    # URL of the webpage to scrape
    url = 'https://sekai-world.github.io/sekai-master-db-diff/cards.json'

    # Send a GET request to the webpage
    response = requests.get(url)

    database = json.loads(response.content)
    #print(database[1033]['id'])
    return database

def get_res_no(id,database):

    res_no = list(filter(lambda x:x["id"]==id,database))[0]["assetbundleName"]
    res = res_no[3:6]
    no = res_no[9:]
    return(res,no)

def get_res_nos(ids,database):
    for id in ids:
        print(get_res_no(id,database))


if __name__=="__main__":
    card_num = int(input("Number of cards : "))
    database = get_database()
    for _ in range(card_num):
        print(get_res_no(int(input("card_id : ")),database))