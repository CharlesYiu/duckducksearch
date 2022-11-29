#! /usr/bin/env node
const Renderer = require("./renderer");
const query = require("./query");
const open = require("open");

const renderer = Renderer();
renderer.renderResults(
    (text) => query(text),
    (url) => open(url)
);
