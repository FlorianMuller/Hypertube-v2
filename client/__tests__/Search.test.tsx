import React from "react";
import Adapter from "enzyme-adapter-react-16";
import EnzymeToJson from "enzyme-to-json";
import { configure } from "enzyme";
import { History, Location, LocationState } from "history";

import Search from "../components/Search";

import { mountWithIntl } from "./helpers/intl-enzyme-test-helper";

import * as ServiceSearch from "../components/Search/service";
import { UseApiReturn, ApiSearchReponse } from "../models/models";

configure({ adapter: new Adapter() });

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: (): History<LocationState> => ({
    length: null,
    action: null,
    location: { pathname: "/search", search: "", state: {}, hash: null },
    push: jest.fn(),
    replace: jest.fn(),
    go: jest.fn(),
    goBack: jest.fn(),
    goForward: jest.fn(),
    block: jest.fn(),
    listen: jest.fn(),
    createHref: jest.fn()
  }),
  useLocation: (): Location<LocationState> => ({
    pathname: "/search",
    search: "",
    state: {},
    hash: null
  })
}));

jest.mock("../hooks/useApi", () => (): UseApiReturn<
  ApiSearchReponse,
  void
> => ({
  callApi: jest.fn(),
  loading: false,
  res: {
    data: { movies: [], nextPage: false },
    status: 200,
    statusText: null,
    headers: null,
    config: null
  },
  resData: { movies: [], nextPage: false },
  error: null,
  setUrl: jest.fn(),
  setMethod: jest.fn(),
  setHeaders: jest.fn(),
  setData: jest.fn(),
  cancelAllRequests: jest.fn()
}));

describe("Search", () => {
  describe("search en", () => {
    it("renders correctly", () => {
      const domNode = mountWithIntl(<Search />, "en");
      expect(EnzymeToJson(domNode)).toMatchSnapshot();
    });
  });

  describe("search fr", () => {
    it("renders correctly", () => {
      const domNode = mountWithIntl(<Search />, "fr");
      expect(EnzymeToJson(domNode)).toMatchSnapshot();
    });
  });

  describe("Service", () => {
    describe("formatQueryUrl", () => {
      it("should get a full query", () => {
        const testQuery = ServiceSearch.formatQueryUrl(
          "?query=top&collections%5B0%5D=collec1&collections%5B1%5D=collec2",
          1
        );

        expect(testQuery).toBe(
          "/movies?query=top&collections%5B0%5D=collec1&collections%5B1%5D=collec2&page=1"
        );
      });

      it("should get a empty query", () => {
        const testQuery = ServiceSearch.formatQueryUrl("", 1);
        expect(testQuery).toBe("/movies?page=1");
      });
    });
  });
});
