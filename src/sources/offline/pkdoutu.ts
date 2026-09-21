import { load } from "cheerio";
import { defineSource } from "../defineSource";
import { get } from "@/utils/http";

/**
 * pk斗图网 https://www.pkdoutu.com
 * 实现保留但从未上架(与现有图源重叠度较高);检测可观测其死活
 */
export default defineSource({
  id: "pkdoutu",
  label: "pk斗图",
  host: "https://www.pkdoutu.com",
  enabled: false,

  async fetchPage({ keyword, page, signal }) {
    const $ = load(
      await get<string>(
        "https://www.pkdoutu.com/search",
        { type: "photo", page, keyword, more: 1 },
        { signal },
      ),
    );
    const links = $(".random_picture img.image_dtb")
      .map((_, img) => img.attribs["data-original"])
      .get();
    return { links };
  },
});
