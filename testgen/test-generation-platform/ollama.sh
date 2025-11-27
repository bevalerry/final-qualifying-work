#!/bin/sh
/bin/ollama serve &
sleep 10
ollama pull mistral
wait