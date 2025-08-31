FROM denoland/deno:2.4.5

USER deno

COPY . .
RUN deno install
RUN deno test

CMD ["run", "main.ts"]
