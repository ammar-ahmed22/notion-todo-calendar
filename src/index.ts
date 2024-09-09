import dotenv from "dotenv";
dotenv.config({ path: "config.env" });
import express from "express";
import Notion from "./utils/notion";
import Calendar from "./utils/calendar";
import path from "path";

if (!process.env.NOTION_TOKEN) {
  throw new Error("NOTION_TOKEN environment variable is required!");
}

if (!process.env.DB_ID) {
  throw new Error("DB_ID environment variable is required!");
}

const PORT = process.env.PORT || 3000;

const app = express();

const notion = new Notion(process.env.NOTION_TOKEN);

app.get("/", (_, res) => {
  res.send({ message: "use /calendar.ics to subscribe/download calendar!" });
})

app.get("/calendar.ics", async (req, res) => {
  const results = await notion.paginatedDatabaseQuery({ database_id: process.env.DB_ID!, filter: { or: [] }});
  let calendar = new Calendar("-//AmmarAhmed", { minimumDuration: 10 * 60000 });
  results.forEach(result => {
    try {
      let name = Notion.extractPropertyValue(result.properties["Name"], "string");
      let className = Notion.extractPropertyValue(result.properties["Class"], "string");
      let status = Notion.extractPropertyValue(result.properties["Status"], "string");
      let dueDate = Notion.extractPropertyValue(result.properties["Due Date"], "date");
      if (status !== "Done") {
        calendar.addEvent({
          title: `${name} | ${className}`,
          end: dueDate.end ?? dueDate.start,
          start: dueDate.start,
          id: result.id,
          created: new Date(result.created_time)
        })
      }
    } catch (error) {
      res.status(400);
      return res.send({ error });
    }
  })

  res.setHeader("Content-Disposition", 'attachment; filename="calendar.ics"');
  res.setHeader("Content-Type", "text/calendar");
  return res.send(calendar.generate());
})

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}.`))