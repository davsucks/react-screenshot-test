import axios, { AxiosResponse } from "axios";
import { dummy } from "../../testing/dummy";
import { mocked } from "../../testing/mock";
import { partialMock } from "../../testing/partial-mock";
import { ServerRenderer } from "./server-renderer";

jest.mock("axios");

const SERVER_URL = "http://localhost:1234";

describe("ServerRenderer", () => {
  const dummyBinaryScreenshot: Buffer = dummy();

  beforeEach(() => {
    jest.resetAllMocks();
    mocked(axios.post).mockResolvedValue(
      partialMock<AxiosResponse>({
        data: dummyBinaryScreenshot
      })
    );
  });

  describe("render", () => {
    it("takes a screenshot", async () => {
      const renderer = new ServerRenderer(SERVER_URL);
      await renderer.start();
      const screenshot = await renderer.render("http://example.com");
      expect(screenshot).toBe(dummyBinaryScreenshot);
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:1234/render",
        {
          url: "http://example.com"
        },
        {
          responseType: "arraybuffer"
        }
      );
    });

    it("sets the viewport if provided", async () => {
      const renderer = new ServerRenderer(SERVER_URL);
      await renderer.start();
      await renderer.render("http://example.com", {
        width: 1024,
        height: 768
      });
      expect(axios.post).toHaveBeenCalledWith(
        expect.anything(),
        {
          url: "http://example.com",
          viewport: {
            width: 1024,
            height: 768
          }
        },
        expect.anything()
      );
    });

    it("does not set the viewport if not provided", async () => {
      const renderer = new ServerRenderer(SERVER_URL);
      await renderer.start();
      await renderer.render("http://example.com");
      expect(axios.post).toHaveBeenCalledWith(
        expect.anything(),
        {
          url: "http://example.com"
        },
        expect.anything()
      );
    });
  });
});