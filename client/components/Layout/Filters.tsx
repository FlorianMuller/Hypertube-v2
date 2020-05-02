import React, { ReactElement, useState, useEffect, ChangeEvent } from "react";
import moment from "moment";
import _ from "lodash";
import qs from "qs";
import { useIntl } from "react-intl";
import { useLocation, useHistory } from "react-router-dom";
import { Paper, Select, MenuItem, InputLabel, Chip } from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import { Delete as DeleteIcon } from "@material-ui/icons";

import CollectionSelect from "./CollectionSelect";
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
  collection: "all",
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
  const [collection, setCollection] = useState<string>(
    searchParams.collection || defaultValue.collection
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
  const debouncedCollection = useDebounce(collection, 500);
  const debouncedMinRating = useDebounce(minRating, 500);
  const debounceSort = useDebounce(sort, 500);

  const areFiltersDefault = (): boolean =>
    year === defaultValue.year &&
    collection === defaultValue.collection &&
    minRating === defaultValue.minRating &&
    sort === defaultValue.sort;

  useEffect(() => {
    const newUrlParams = qs.parse(location.search.slice(1));
    if (newUrlParams.year) setYear(newUrlParams.year);
    if (newUrlParams.collection) setCollection(newUrlParams.collection);
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
        collection:
          debouncedCollection !== defaultValue.collection
            ? debouncedCollection
            : undefined,
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
      debouncedCollection !== defaultValue.collection ||
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
    debouncedCollection,
    debouncedMinRating,
    debounceSort
  ]);

  const resetFilter = (): void => {
    setYear(defaultValue.year);
    setCollection(defaultValue.collection);
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

      {/* Collection */}
      <div className={classes.filterElement}>
        <InputLabel id="collection">
          {_t({ id: "layout.filters.collection" })}
        </InputLabel>
        <CollectionSelect
          labelid="collection"
          collection={collection}
          setCollection={setCollection}
        />
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
