#This file will be used to backfill the meme database
import requests
import os
import json

currentDirectory = os.getcwd()
with open(currentDirectory + '\\memeData\\PrequelMemes.txt', 'a+') as outfile:
    url = 'https://www.reddit.com/r/prequelmemes/top/.json?sort=top&t=all&limit=100'
    reqHeaders = {
        'User-Agent' : 'personal:Gary:v1.1.0 (by /u/broseidon16)'
    }
    r = requests.get(url, headers=reqHeaders)

    data = r.json()

    for post in data['data']['children']:
        if post['data']['is_self'] not False and post['data']['over_18'] not False:
            outfile.write(post['data']['url'].strip('"') + '\n')


#all this is just for reference 
""" url = 'https://www.reddit.com/r/dndmemes/top/.json?sort=top&t=day&limit=10'

headers = {
    'User-Agent' : 'personal:Gary:v1.1.0 (by /u/broseidon16)'
    }

r = requests.get(url,headers=headers)

data = r.json()
index = 0
while data['data']['children'][index]['data']['is_self'] != False and index < 10:
    index +=1

#get the post url
with open('post_url.txt', 'w') as outfile:
    outfile.write("https://www.reddit.com/r/dndmemes/comments/" + data['data']['children'][index]['data']['id'].strip('"'))
#get the image url
with open('post_image_url.txt', 'w') as outfile:
    outfile.write(data['data']['children'][index]['data']['url'].strip('"'))
#get the username of the poster
with open('post_username.txt', 'w') as outfile:
    outfile.write(data['data']['children'][index]['data']['author'].strip('"'))
#get the title of the post
with open('post_title.txt', 'w') as outfile:
    outfile.write(data['data']['children'][index]['data']['title'].strip('"')) """
