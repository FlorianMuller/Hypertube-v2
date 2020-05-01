import React, { ReactElement, ChangeEvent } from "react";
import { useIntl } from "react-intl";

import { MenuItem, Select } from "@material-ui/core";

import { useFiltersStyles } from "./Layout.styles";

interface Props {
  collection: string;
  setCollection: (value: string) => void;
  labelid: string;
}

const collectionName = [
  "action",
  "adventure",
  "animation",
  "biography",
  "comedy",
  "crime",
  "documentary",
  "drama",
  "family",
  "fantasy",
  "filmNoir",
  "history",
  "horror",
  "music",
  "musical",
  "news",
  "mystery",
  "realityTV",
  "romance",
  "sciFi",
  // "tvMovie", // We're not searching on TMDb, we can't search this category
  // "shortFilm", // Not found on YTS 🤷🏻‍♂️ (but on IMDb)
  "sport",
  "superhero",
  "thriller",
  "war",
  "western"
];

const CollectionSelect = ({
  collection,
  setCollection,
  labelid
}: Props): ReactElement => {
  const { formatMessage: _t } = useIntl();
  const classes = useFiltersStyles({});

  return (
    <Select
      labelId={labelid}
      defaultValue={collection}
      value={collection}
      onChange={(e: ChangeEvent<{ value: string }>): void =>
        setCollection(e.target.value)
      }
      className={classes.select}
    >
      <MenuItem value="all" id="menuitem-default">
        {_t({ id: "layout.filters.all" })}
      </MenuItem>

      {collectionName.map((name) => (
        <MenuItem value={name} id={`menuitem-${name}`} key={name}>
          {_t({ id: `layout.filters.select_category.${name}` })}
        </MenuItem>
      ))}
    </Select>
  );
};

export default CollectionSelect;
