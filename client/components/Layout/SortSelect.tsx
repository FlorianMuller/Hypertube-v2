import React, { ReactElement, ChangeEvent } from "react";
import { useIntl } from "react-intl";

import { MenuItem, Select } from "@material-ui/core";

import { useFiltersStyles } from "./Layout.styles";

interface Props {
  sort: string;
  labelid: string;
  setSort: (value: string) => void;
}

const SortSelect = ({ sort, labelid, setSort }: Props): ReactElement => {
  const { formatMessage: _t } = useIntl();
  const classes = useFiltersStyles({});

  return (
    <Select
      labelId={labelid}
      defaultValue={sort}
      value={sort}
      onChange={(e: ChangeEvent<{ value: string }>): void =>
        setSort(e.target.value)
      }
      className={classes.select}
    >
      <MenuItem value="dateAdded" id="menuitem-dateAdded">
        {_t({ id: "layout.filters_sort.dateAdded" })}
      </MenuItem>
      <MenuItem value="seeds" id="menuitem-seeds">
        {_t({ id: "layout.filters_sort.seeds" })}
      </MenuItem>
      <MenuItem value="title" id="menuitem-title">
        {_t({ id: "layout.filters_sort.title" })}
      </MenuItem>
      <MenuItem value="year" id="menuitem-year">
        {_t({ id: "layout.filters_sort.year" })}
      </MenuItem>
      <MenuItem value="rating" id="menuitem-rating">
        {_t({ id: "layout.filters_sort.rating" })}
      </MenuItem>
    </Select>
  );
};

export default SortSelect;
