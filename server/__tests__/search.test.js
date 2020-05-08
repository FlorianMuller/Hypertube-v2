import { searchMoviesOnYts } from "../Helpers/searchSources/yts";

describe("Search", () => {
  describe("Helper/search movies", () => {
    // it("Should get the data", async () => {
    //   const filters = {
    //     minRating: 0,
    //     year: 2017,
    //     genre: "action"
    //   };

    //   const res = await searchMoviesOnYts(filters, 0);

    //   expect(res).toBeDefined();
    //   expect(res).toHaveProperty("nextPage");
    //   expect(res).toHaveProperty("movies");
    //   expect(res.movies).toBeInstanceOf(Array);
    // });

    it("Should send empty list", async () => {
      const filters = {
        sort: "this sort doesn't exist"
      };

      const res = await searchMoviesOnYts(filters, 0);

      expect(res).toEqual({
        name: "yts",
        nextPage: false,
        movies: []
      });
    });
  });
});
