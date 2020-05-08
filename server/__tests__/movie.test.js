import mongoose from "../mongo";
import MovieCommentModel from "../Schemas/MovieComment";
import UserHistoryModel from "../Schemas/UserHistory";
import movieHelpers from "../Helpers/movie";

describe("Movie Comments", () => {
  let mockedMovieId;
  let mockedUserId;
  let mockedUserId2;
  let mockedUserId3;
  let mockedUserId4;
  let mockedReview;
  let finalReview;
  // let mockedHistory;
  // let finalHistory;

  beforeAll(() => {
    mockedMovieId = "B123rR";
    mockedReview = {
      _id: new mongoose.Types.ObjectId(),
      movieId: mockedMovieId,
      movieName: "4242",
      authorUsername: "TestMan",
      date: new Date(1577118711809),
      stars: 4,
      body: "That was actually really awesome"
    };
    finalReview = {
      ...mockedReview,
      __v: 0
    };
    // mockedHistory = {
    //   _id: mockedUserId,
    //   userId: "42",
    //   movieId: mockedMovieId,
    //   movieName: "ExampleMovie",
    //   date: 1577118711809
    // };
    // finalHistory = {
    //   ...mockedHistory,
    //   __v: 0
    // };
  });

  afterAll(async () => {
    await MovieCommentModel.deleteOne({ _id: mockedUserId });
    await MovieCommentModel.deleteOne({ _id: mockedUserId2 });
    await MovieCommentModel.deleteOne({ _id: mockedUserId3 });
    await MovieCommentModel.deleteOne({ _id: mockedUserId4 });
    await UserHistoryModel.deleteOne({ _id: mockedUserId });
  });

  it("shouldn't inserts user's review when less stars than allowed", async () => {
    const mockedMinimumStarsReview = {
      ...mockedReview,
      stars: 0
    };
    const errorMessage =
      "movieComments validation failed: stars: Path `stars` (0) is less than minimum allowed value (1).";
    const errSaveReview = await movieHelpers.saveReview(
      mockedMinimumStarsReview
    );
    expect(errSaveReview).toEqual(errorMessage);
  });

  it("shouldn't inserts user's review when bigger stars than allowed", async () => {
    const mockedMaximumStarsReview = {
      ...mockedReview,
      stars: 6
    };
    const errorMessage =
      "movieComments validation failed: stars: Path `stars` (6) is more than maximum allowed value (5).";
    const errSaveReview = await movieHelpers.saveReview(
      mockedMaximumStarsReview
    );
    expect(errSaveReview).toEqual(errorMessage);
  });

  it("should inserts user's review", async () => {
    const insetedReview = await movieHelpers.saveReview(mockedReview);

    expect(insetedReview.toJSON()).toEqual(finalReview);
  });

  it("should finds user's review", async () => {
    const ourReviews = await movieHelpers.findReviews(mockedMovieId);
    expect(
      ourReviews.review.filter(({ id }) => finalReview._id.equals(id)).length
    ).toBe(1);
  });

  // it("should sorts both reviews from API and Database", () => {
  //   const mockedApiReviews = [
  //     {
  //       ...mockedReview,
  //       _id: "0123456789"
  //     },
  //     {
  //       ...mockedReview,
  //       _id: "0123456789",
  //       date: new Date(1575500400000)
  //     }
  //   ];
  //   const mockedOurReviews = [
  //     { ...mockedReview, _id: "0123456789", date: new Date(1576278000000) },
  //     { ...mockedReview, _id: "0123456789", date: new Date(1575759600000) }
  //   ];
  //   const bothReviews = movieHelpers.sortReviews(
  //     mockedApiReviews,
  //     mockedOurReviews
  //   );
  //   expect(bothReviews).toEqual([
  //     {
  //       _id: "0123456789",
  //       movieId: "B123rR",
  //       movieName: "4242",
  //       authorUsername: "TestMan",
  //       date: "Dec, 05, 2019",
  //       stars: 4,
  //       body: "That was actually really awesome"
  //     },
  //     {
  //       _id: "0123456789",
  //       movieId: "B123rR",
  //       movieName: "4242",
  //       authorUsername: "TestMan",
  //       date: "Dec, 08, 2019",
  //       stars: 4,
  //       body: "That was actually really awesome"
  //     },
  //     {
  //       _id: "0123456789",
  //       movieId: "B123rR",
  //       movieName: "4242",
  //       authorUsername: "TestMan",
  //       date: "Dec, 14, 2019",
  //       stars: 4,
  //       body: "That was actually really awesome"
  //     },
  //     {
  //       _id: "0123456789",
  //       movieId: "B123rR",
  //       movieName: "4242",
  //       authorUsername: "TestMan",
  //       date: "Dec, 23, 2019",
  //       stars: 4,
  //       body: "That was actually really awesome"
  //     }
  //   ]);
  // });

  // it("should logs user's history", async () => {
  //   await movieHelpers.logHistory(mockedHistory);
  //   const userHistory = await UserHistoryModel.findById(mockedUserId);
  //   expect(userHistory.toJSON()).toEqual(finalHistory);
  // });
});
