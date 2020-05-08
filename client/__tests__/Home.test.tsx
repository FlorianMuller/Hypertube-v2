import React from "react";
import { StaticRouter } from "react-router-dom";
import EnzymeToJson from "enzyme-to-json";

import Home from "../components/Home/Home";
import { mountWithIntl } from "./helpers/intl-enzyme-test-helper";
import { UseApiReturn, Movie } from "../models/models";

const mockedMoviesList = [
  {
    id: "1",
    title: "The comic movies",
    cover: "path/to/pic",
    year: 2020,
    summary: "The one with Dany Boon you kwow, all the France is gonna laugh",
    genres: ["comedy"],
    rating: 4,
    runtime: 100,
    viewed: false
  },
  {
    id: "2",
    title: "The marvel block buster",
    cover: "path/to/pic",
    year: 2020,
    summary: "You've seen it hundreds time, but here it is, an other one",
    genres: ["action", "adventure"],
    rating: 4,
    runtime: 100,
    viewed: false
  },
  {
    id: "3",
    title: "The cool kid moovie",
    cover: "path/to/pic",
    year: 2020,
    summary: "The one with jokes for the parents",
    genres: ["action", "adventure"],
    rating: 4,
    runtime: 100,
    viewed: false
  },
  {
    id: "4",
    title: "The horror movie",
    cover: "path/to/pic",
    year: 2020,
    summary: "I don't know anything about it, I was too afraid to see it",
    genres: ["horror"],
    rating: 4,
    runtime: 100,
    viewed: false
  }
];

jest.mock("../hooks/useApi", () => (): UseApiReturn<
  { list: Movie[] },
  void
> => ({
  callApi: jest.fn(),
  loading: false,
  res: {
    data: { list: mockedMoviesList },
    status: 200,
    statusText: null,
    headers: null,
    config: null
  },
  resData: { list: mockedMoviesList },
  error: null,
  setUrl: jest.fn(),
  setMethod: jest.fn(),
  setHeaders: jest.fn(),
  setData: jest.fn(),
  cancelAllRequests: jest.fn()
}));

describe("Home", () => {
  it("should render <Home> in english", () => {
    const domNode = mountWithIntl(
      <StaticRouter>
        <Home />
      </StaticRouter>,
      "en"
    );
    expect(EnzymeToJson(domNode)).toMatchSnapshot();
  });

  it("should render <Home> in french", () => {
    const domNode = mountWithIntl(
      <StaticRouter>
        <Home />
      </StaticRouter>,
      "fr"
    );
    expect(EnzymeToJson(domNode)).toMatchSnapshot();
  });
});
