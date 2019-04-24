import requests

import json

url = 'https://www.reddit.com/r/dndmemes/top/.json?sort=top&t=day&limit=10'

headers = {
    'User-Agent' : 'personal:Gary:v1.2.0 (by /u/broseidon16)'
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
    outfile.write(data['data']['children'][index]['data']['title'].strip('"'))


#also grab different things like the username, the title, and the link to the image if possible.
