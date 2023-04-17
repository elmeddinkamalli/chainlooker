#!/usr/bin/env node
  
const arguments = process.argv;
const data = arguments[2];
function f(){
  return data.replace(/[^a-zA-Z0-9]+/g, "-");
}
process.stdout.write(f());