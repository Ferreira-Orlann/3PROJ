import urllib3
import json
from utils.print_json import print_json

user = urllib3.request("POST", "http://localhost:3000/users", json={
    "username": "string",
    "firstname": "string",
    "lastname": "string",
    "email": "string",
    "address": "string;"
})

user_uuid = json.loads(user.data)["uuid"]

session = urllib3.request("GET", "http://localhost:3000/auth/login?uuid=" + user_uuid)

token = json.loads(session.data)["token"]

headers = {
    "Authorization": "Bearer " + token
}

workspace = urllib3.request("POST", "http://localhost:3000/workspaces", json={
    "name": "string",
    "owner_uuid": json.loads(user.data)["uuid"]
}, headers=headers)

workspace_uuid = json.loads(workspace.data)["uuid"]

member = urllib3.request("POST", "http://localhost:3000/workspaces/" + workspace_uuid + "/members", json={
    "user_uuid": user_uuid
}, headers=headers)

channel = urllib3.request("POST", "http://localhost:3000/workspaces/" + workspace_uuid + "/channels", json={
    "name": "string",
    "workspace_uuid": workspace_uuid,
    "creator_uuid": user_uuid
}, headers=headers)

channel_uuid = json.loads(channel.data)["uuid"]

# message = urllib3.request("POST", "http://localhost:3000/workspaces/" + workspace_uuid + "/channels", json={
#     "name": "string",
#     "workspace_uuid": workspace_uuid,
#     "creator_uuid": user_uuid
# }, headers=headers)

print_json(json.dumps({
    "user": user_uuid,
    "session_token": token,
    "workspace": workspace_uuid,
    "member": json.loads(member.data)["uuid"],
    "channel": channel_uuid
}))

# import calendar
# import time

# NumOfSeconds=10                              #Number of seconds we average over
# count=0                                       #Number of time message will end up being displayed
# #Time since the epoch in seconds + time of seconds in which we count
# EndTime=calendar.timegm(time.gmtime()) + NumOfSeconds  

# while calendar.timegm(time.gmtime())<EndTime: #While we are not at the end point yet
#     user = urllib3.request("POST", "http://localhost:3000/users", json={
#         "username": "string",
#         "firstname": "string",
#         "lastname": "string",
#         "email": "string",
#         "address": "string;"
#     })

#     count=count+1                             #Count message printed

# print(float(count)/NumOfSeconds)              #Average number of prints per second