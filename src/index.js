#! /usr/bin/env node
const Render = require("./render")
const query = require("./query")
const open = require("open")

const render = Render()
render.results((text) => query(text), (url) => open(url))