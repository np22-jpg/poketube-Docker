/*

    PokeTube is a Free/Libre youtube front-end !
    
    Copyright (C) 2021-2022 POKETUBE
 
    This file is Licensed under LGPL-3.0-or-later. Poketube itself is GPL, Only this file is LGPL.
    
    see a copy here:https://www.gnu.org/licenses/lgpl-3.0.txt
    
    please dont remove this comment while sharing this code 
    
  */

const fetch = require("node-fetch");
const { toJson } = require("xml2json");

const fetcher = require("../libpoketube/libpoketube-fetcher.js");
const getColors = require("get-image-colors");

const wiki = require("wikipedia");

const config = {
  tubeApi: "https://tube-srv.ashley143.gay/api/",
  invapi: "https://vid.puffyan.us/api/v1",
  dislikes: "https://returnyoutubedislikeapi.com/votes?videoId=",
  t_url: "https://t.poketube.fun/", //  def matomo url
};

// Util functions
function getJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function checkUnexistingObject(obj) {
  if (obj !== null) {
    if (obj.authorId !== null) {
      if (obj !== undefined) {
        if (obj.authorId !== undefined) {
          return true;
        }
      }
    }
  }
}

/*
 * Api functions
 */

async function channel(id, cnt) {
  if (id == null) return "Gib ID";

  const videos = await fetch(
    `${config.tubeApi}channel?id=${id}&tab=videos&continuation=${cnt || ""}`
  )
    .then((res) => res.text())
    .then((xml) => getJson(toJson(xml)));

  const about = await fetch(`${config.tubeApi}channel?id=${id}&tab=about`)
    .then((res) => res.text())
    .then((xml) => getJson(toJson(xml)));

  return { videos, about };
}

async function video(v) {
  if (v == null) return "Gib ID";

  let nightlyRes;
  var desc = "";

  var inv_comments = await fetch(`${config.invapi}/comments/${v}`).then((res) =>
    res.text()
  );

  var comments = await getJson(inv_comments);

  var video_new_info = await fetch(`${config.invapi}/videos/${v}`).then((res) =>
    res.text()
  );

  var vid = await getJson(video_new_info);
  if (checkUnexistingObject(vid)) {
 
    var a;
    
    try {
    var a = await fetch(
      `${config.tubeApi}channel?id=${vid.authorId}&tab=about`
    )
      .then((res) => res.text())
      .then((xml) => getJson(toJson(xml)));
    } catch {
      var a = ""  
    }
    
    const summary = await wiki
      .summary(vid.author + " ")
      .then((summary_) =>
        summary_.title !== "Not found." ? summary_ : "none"
      );

    desc = a.Channel?.Contents?.ItemSection?.About?.Description;

    const data = await fetcher(v);

    const nightlyJsonData = getJson(nightlyRes);

    return {
      json: data.video.Player,
      video: await fetch(`${config.tubeApi}video?v=${v}`)
        .then((res) => res.text())
        .then((xml) => getJson(toJson(xml))),
      vid,
      comments,
      engagement: data.engagement,
      wiki: summary,
      desc: desc,
      color: await getColors(
        `https://i.ytimg.com/vi/${v}/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLBy_x4UUHLNDZtJtH0PXeQGoRFTgw`
      ).then((colors) => colors[0].hex()),
      color2: await getColors(
        `https://i.ytimg.com/vi/${v}/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLBy_x4UUHLNDZtJtH0PXeQGoRFTgw`
      ).then((colors) => colors[1].hex()),
    };
  }
}

async function search(query, cnt) {
  if (query == null) return "Gib Query";

  const data = await fetch(
    `${config.tubeApi}search?query=${query}&continuation=${cnt || ""}`
  )
    .then((res) => res.text())
    .then((xml) => getJson(toJson(xml)));

  return data;
}

async function isvalidvideo(v) {
  if (v != "assets") {
    var status;

    async function ryd() {
      try {
        const engagement = await fetch(`${config.dislikes}${v}`).then((res) =>
          res.json()
        );
        return engagement;
      } catch {}
    }

    if (ryd.status) {
      status = await ryd.status();
    } else {
      status = "200";
    }

    if (status == 400) {
      return false;
    } else {
      return true;
    }
  }
}

module.exports = {
  search,
  video,
  isvalidvideo,
  channel,
};
