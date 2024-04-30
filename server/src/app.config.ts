import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import express from 'express'
import * as path from 'path'

/**
 * Import your Room files
 */
import { MoveItRoom } from "./rooms/Room";

export default config({

  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define('moveIt', MoveItRoom);

  },

  initializeExpress: (app) => {
    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    app.get("/hello_world", (req, res) => {
      res.send("It's time to kick ass and chew bubblegum!");
    });

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== "production") {
      // app.use("/", playground);
      // app.use(express.static(path.join(__dirname, '../client-dist/')))
    }

    app.use((req, res, next) => {
      if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
        next();
      } else {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        res.sendFile(path.join(__dirname, '../client-dist/', 'index.html'));
      }
    });
    app.use(express.static(path.join(__dirname, '../client-dist/')));

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use("/colyseus", monitor());
  },


  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  }
});
