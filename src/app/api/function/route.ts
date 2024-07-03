import crypto from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const methods = {
  "Search Plain": "plain",
  "Search Embed": "embed",
};

export async function PUT(req: NextRequest) {
  const res = await req.json();

  const signingKey = process.env.SIGNING_KEY as string;
  const requestBody = JSON.stringify(res);

  const keyBuffer = Buffer.from(signingKey, "hex");
  const hmac = crypto.createHmac("sha256", keyBuffer);

  hmac.update(requestBody, "utf8");

  const digest = hmac.digest();
  const signature = digest.toString("base64");

  if (signature !== req.headers.get("X-Signature")) {
    return NextResponse.error();
  }

  return NextResponse.json({
    result: {
      type: "wam",
      attributes: {
        appId: process.env.APP_ID as string,
        name: "search",
        wamArgs: {
          type: methods[res.method as keyof typeof methods],
        },
      },
    },
  });
}
