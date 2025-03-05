import requests
import json

group_mapping = {"school_refusal":"25", "idol":"mmj", "light_sound":"ln", "none":"na", "street":"vbs", "theme_park":"ws"}
attr_mapping = {"cool":"david", "pure":"green", "cute":"star", "happy":"heart", "mysterious":"moon"}

def get_database():
    # URL of the webpage to scrape
    url = 'https://sekai-world.github.io/sekai-master-db-diff/cards.json'

    # Send a GET request to the webpage
    response = requests.get(url)

    database = json.loads(response.content)
    #print(database[1033]['id'])
    return database

def download_database():
    data = get_database()
    with open("cards.json","w") as f:
        f.write(json.dumps(data))

def get_res_no(id,database):

    raw = list(filter(lambda x:x["id"]==id,database))[0]
    res_no = raw["assetbundleName"]
    attr = attr_mapping[raw["attr"]]
    
    
    res = res_no[3:6]
    no = res_no[9:]
    group = group_mapping[raw["supportUnit"]] if int(res) > 20 else (int(res)-1)//4 + 1
    return(res,no,attr,group)

def get_res_nos(ids,database):
    for id in ids:
        print(get_res_no(id,database))

def get_Lim(database):
    raw = list(filter(lambda x:(x["cardRarityType"] == "rarity_4"),database))
    raw = list(filter(lambda x:x["cardSupplyId"] in [3,4,5],raw))
    raw = list(filter(lambda x:x['id'] in [335, 336, 337, 338, 339, 1096],database)) + raw
    print(len(raw))

if __name__=="__main__":
    card_num = int(input("Number of cards : "))
    database = get_database()
    get_Lim(database)
    for _ in range(card_num):
        print(get_res_no(int(input("card_id : ")),database))