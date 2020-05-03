import React, { ReactElement, useState, useEffect, ChangeEvent } from "react";
import moment from "moment";
import _ from "lodash";
import qs from "qs";
import { useIntl } from "react-intl";
import { useLocation, useHistory } from "react-router-dom";
import { Paper, Select, MenuItem, InputLabel, Chip } from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import { Delete as DeleteIcon } from "@material-ui/icons";

import GenreSelect from "./GenreSelect";
import SortSelect from "./SortSelect";
import useDebounce from "../../hooks/useDebounce";
import { useFiltersStyles } from "./Layout.styles";
import { Filters as FiltersType } from "../../models/models";

interface Props {
  searchQuery: string;
  onReset: () => void;
}

const defaultValue: FiltersType = {
  year: 0,
  genre: "all",
  minRating: null,
  sort: "dateAdded"
};

const Filters = ({ searchQuery, onReset }: Props): ReactElement => {
  const classes = useFiltersStyles({});
  const location = useLocation();
  const history = useHistory();
  const { formatMessage: _t } = useIntl();

  /**
   * Filters diplayed value
   */
  const searchParams = qs.parse(location.search.slice(1));
  const [year, setYear] = useState<number>(
    searchParams.year || defaultValue.year
  );
  const [genre, setGenre] = useState<string>(
    searchParams.genre || defaultValue.genre
  );
  const [minRating, setMinRating] = useState<number>(
    searchParams.minRating || defaultValue.minRating
  );
  const [sort, setSort] = useState<string>(
    searchParams.sort || defaultValue.sort
  );

  /**
   * Filters debonced value
   * (display value with a 500ms, the one we send to the api)
   */
  const debouncedQueryField = useDebounce(searchQuery, 500);
  const debouncedYear = useDebounce(year, 500);
  const debouncedGenre = useDebounce(genre, 500);
  const debouncedMinRating = useDebounce(minRating, 500);
  const debounceSort = useDebounce(sort, 500);

  const areFiltersDefault = (): boolean =>
    year === defaultValue.year &&
    genre === defaultValue.genre &&
    minRating === defaultValue.minRating &&
    sort === defaultValue.sort;

  useEffect(() => {
    const newUrlParams = qs.parse(location.search.slice(1));
    if (newUrlParams.year) setYear(newUrlParams.year);
    if (newUrlParams.genre) setGenre(newUrlParams.genre);
    if (newUrlParams.minRating) setMinRating(newUrlParams.minRating);
    if (newUrlParams.sort) setSort(newUrlParams.sort);
  }, [location]);

  /**
   * Changing url
   */
  useEffect(() => {
    const queryParams = qs.stringify(
      {
        query: debouncedQueryField,
        genre:
          debouncedGenre !== defaultValue.genre ? debouncedGenre : undefined,
        year: debouncedYear,
        minRating: debouncedMinRating,
        sort: debounceSort !== defaultValue.sort ? debounceSort : undefined
      },
      {
        addQueryPrefix: true,
        skipNulls: true,
        filter: (_prefix, value) => value || undefined
      }
    );

    // If we're on a search page or if one filters has been changed
    if (
      history.location.pathname === "/search" ||
      debouncedQueryField ||
      debouncedYear ||
      debouncedGenre !== defaultValue.genre ||
      debouncedMinRating ||
      debounceSort !== defaultValue.sort
    ) {
      history.push({
        pathname: `/search`,
        search: queryParams
      });
    }
  }, [
    debouncedQueryField,
    debouncedYear,
    debouncedGenre,
    debouncedMinRating,
    debounceSort
  ]);

  const resetFilter = (): void => {
    setYear(defaultValue.year);
    setGenre(defaultValue.genre);
    setMinRating(defaultValue.minRating);
    setSort(defaultValue.sort);
    // Reset all param outside of <Filters>:
    onReset();
  };

  return (
    <Paper className={classes.paper}>
      {/* Reset */}
      <div className={classes.resetFilterButtonWrapper}>
        {!areFiltersDefault() && (
          <Chip
            label={_t({ id: "layout.filters.select.reset" })}
            variant="outlined"
            color="secondary"
            onClick={resetFilter}
            icon={<DeleteIcon />}
            size="small"
            className={classes.resetFilterButton}
          />
        )}
      </div>

      {/* Production year */}
      <div className={classes.filterElement}>
        <InputLabel id="production-year">
          {_t({ id: "layout.filters.production_year" })}
        </InputLabel>
        <Select
          labelId="production-year"
          value={year}
          onChange={(e: ChangeEvent<{ value: number }>): void =>
            setYear(e.target.value)
          }
          className={classes.select}
        >
          {/* Default year production */}
          <MenuItem
            className={classes.centerItem}
            id="menuitem-yeardefault"
            value={0}
          >
            {_t({ id: "layout.filters.all" })}
          </MenuItem>
          {/* 1900 to now */}
          {_.rangeRight(1900, moment().year() + 1).map((yearSelect: number) => (
            <MenuItem
              className={classes.centerItem}
              id={`menuitem-year${yearSelect}`}
              value={yearSelect}
              key={`menuitem-year${yearSelect}`}
            >
              {yearSelect}
            </MenuItem>
          ))}
        </Select>
      </div>

      {/* Genre */}
      <div className={classes.filterElement}>
        <InputLabel id="genre">{_t({ id: "layout.filters.genre" })}</InputLabel>
        <GenreSelect labelid="genre" genre={genre} setGenre={setGenre} />
      </div>

      {/* Rating */}
      <div className={classes.ratingContainer}>
        <div>
          <InputLabel id="rating">
            {_t({ id: "layout.filters.minrating" })}
          </InputLabel>
          <Rating
            defaultValue={minRating}
            value={minRating || 0}
            onChange={(e, value): void => setMinRating(value)}
            name="ratingmin"
          />
        </div>
      </div>

      {/* Sort */}
      <div className={classes.filterElement}>
        <InputLabel id="sort">{_t({ id: "layout.filters.sort" })}</InputLabel>
        <SortSelect labelid="sort" sort={sort} setSort={setSort} />
      </div>
    </Paper>
  );
};

export default Filters;
