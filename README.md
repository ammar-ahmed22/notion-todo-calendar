<div align="center">
<h1>notion-todo-calendar</h1>
<p>
  iCal subscription link for my Todo items hosted in a Notion database.
</p>
</div>

## What is this?
As many, I use Notion to keep track of all of my todo items. However, I also use my Apple Calendar extensively to see what I have to do on any given day. In order to combine the two, I created this iCal subscription link which grabs all my todo items and inputs them as events in my calendar. This way, I know what I have to do on any given day right from my calendar.

## How does it work?
1. Uses the Notion SDK to query my todo database in Notion
2. Extract the relevant details from the todo item
  - i.e. Name, Class, Due Date, etc.
3. Create a `.ics` file string using the todo details
  - For todo's without an end date, I decided to give them a minimum duration of 10 minutes
  - e.g. I have an Assignment due at 11:59 PM, the event that is created is from 11:49 to 11:59 PM to show me that this is due at this time
4. Serve the `.ics` file using express.js

