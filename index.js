/*
Every x seconds:
    GET User1's Workspace -> Page -> Blocks
    GET User2's Workspace -> Page -> Blocks

    Compare both versions
    Delete page with older version and create new one with the new content
*/

import dotenv from "dotenv";
import { Client } from "@notionhq/client";
dotenv.config();

const user1 = new Client({ auth: process.env.USER1_TOKEN });
const user2 = new Client({ auth: process.env.USER2_TOKEN });

const databaseID_1 = process.env.DATABASE_ID1;
const databaseID_2 = process.env.DATABASE_ID2;

const pageID_1 = process.env.PAGE_ID1;
const pageID_2 = process.env.PAGE_ID2;

async function getPageContent(user, pageID) {
  const response = await user.pages.retrieve({ page_id: pageID });
  console.log(response.properties.title.title);
}

async function searchAllPages(user) {
  const response = await user.search({
    query: "Notion Sync",
    sort: {
      direction: "ascending",
      timestamp: "last_edited_time",
    },
  });
  return response;
}

const searchedPages = await searchAllPages(user1);
console.log(searchedPages);

async function getBlocks(user, pageID) {
  const response = await user.blocks.children.list({
    block_id: pageID,
    page_size: 50,
  });
  return response.results;
}

const currentBlocks_1 = await getBlocks(user1, pageID_1);
// const currentBlocks_2 = await getBlocks(user2,pageID_2)

var blocksasArray = [];
blocksasArray.push(currentBlocks_1);
const blockArray = blocksasArray[0];
const newArray = blockArray.map(
  ({ id, created_time, last_edited_time, ...item }) => item
);
console.log(newArray);

async function createPage(user, parentID, newArray) {
  const response = await user.pages.create({
    parent: { database_id: parentID, page_id: parentID },
    properties: { title: [{ text: { content: "test" } }] },
    children: [
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          text: [{ type: "text", text: { content: "test" } }],
        },
      },
    ],
  });
  return response;
}

const createdPage = await createPage(user1, pageID_1, newArray);

console.log(createdPage);

function compareWorkspaceVersion(currentBlocks_1, currentBlocks_2) {
  return null;
}
