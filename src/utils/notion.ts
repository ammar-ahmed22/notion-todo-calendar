import { DatabaseObjectResponse, PageObjectResponse, QueryDatabaseParameters, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import { Client } from "@notionhq/client"
import { isFullPage } from "@notionhq/client";

type PageProperty = PageObjectResponse["properties"][string];

export type PropertyValueMap = {
  string: string,
  "string[]": string[],
  boolean: boolean,
  date: {
    start: Date,
    end?: Date
  }
}

class Notion {
  private client: Client;
  constructor(auth: string) {
    this.client = new Client({ auth });
  }

  /**
   * Queries a database for all of the full page/database results regardless of pagination
   * 
   * @param args Database query arguments
   * @returns 
   */
  public async paginatedDatabaseQuery(args: QueryDatabaseParameters): Promise<PageObjectResponse[]> {
    let response = await this.client.databases.query(args);
    const results: PageObjectResponse[] = []
    do {
      response.results.forEach(result => {
        if (isFullPage(result)) {
          results.push(result);
        }
      })
      response = await this.client.databases.query({ ...args, start_cursor: response.next_cursor ?? undefined });
    } while(response.has_more && response.next_cursor)

    return results;
  }

  static extractPlainText(richText: RichTextItemResponse[]): string {
    return richText.map(r => r.plain_text).join("");
  }

  static validatePropertyValueType(expected: keyof PropertyValueMap, received: keyof PropertyValueMap) {
    if (expected !== received) {
      throw new Error(`Incorrect type for property value. Expected: '${expected}', Received: '${received}'.`);
    }
  }

  static extractPropertyValue<T extends keyof PropertyValueMap>(property: PageProperty, type: T): PropertyValueMap[T] {
    // const { type } = property;
    switch (property.type) {
      case "title":
        Notion.validatePropertyValueType("string", type);
        return Notion.extractPlainText(property.title) as PropertyValueMap[T];
      case "rich_text":
        Notion.validatePropertyValueType("string", type);
        return Notion.extractPlainText(property.rich_text) as PropertyValueMap[T];
      case "multi_select":
        Notion.validatePropertyValueType("string[]", type);
        return property.multi_select.map(v => v.name) as PropertyValueMap[T];
      case "select":
        Notion.validatePropertyValueType("string", type);
        return (property.select?.name ?? "") as PropertyValueMap[T];
      case "checkbox":
        Notion.validatePropertyValueType("boolean", type);
        return property.checkbox.valueOf() as PropertyValueMap[T];
      case "status":
        Notion.validatePropertyValueType("string", type);
        return (property.status?.name ?? "") as PropertyValueMap[T];
      case "date":
        Notion.validatePropertyValueType("date", type);
        if (!property.date) {
          throw new Error("date is not defined.");
        }
        return {
          start: new Date(property.date.start),
          end: property.date.end ? new Date(property.date.end) : undefined
        } as PropertyValueMap[T]
      default:
        throw new Error(`Unhandled property type: '${property.type}'.`);
        break;
    }
  }

}

export default Notion;