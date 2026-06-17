import { NextResponse } from "next/server";

const ALLOWED: Record<string, string> = {
  golf7: "https://www.automoli.com/common/vehicles/_assets/img/gallery/f89/volkswagen-golf-vii.jpg",
  clio5: "https://upload.wikimedia.org/wikipedia/commons/5/59/Renault_Clio_V_Genf_2019_1Y7A5590.jpg",
  tucson: "https://www.tunisia-rentcar.com/blog/wp-content/uploads/2018/11/2019_Hyundai_Tucson_Limited_0-1-1024x683.jpeg",
  "c-class": "https://stimg.cardekho.com/images/carexteriorimages/630x420/Mercedes-Benz/C-Class/10858/1774342866770/front-left-side-47.jpg",
  dokker: "https://upload.wikimedia.org/wikipedia/commons/2/2a/2012_Dacia_Dokker.JPG",
  dmax: "https://www.auto-plus.tn/assets/modules/newcars/isuzu/dmax-2p/couverture/isuzu_dmax-2p.jpg",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || !ALLOWED[id]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const upstream = await fetch(ALLOWED[id], {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: "Upstream failed" }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
