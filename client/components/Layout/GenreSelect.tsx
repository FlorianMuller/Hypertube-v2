import React, { ReactElement, ChangeEvent } from "react";
import { useIntl } from "react-intl";

import { MenuItem, Select } from "@material-ui/core";

import { useFiltersStyles } from "./Layout.styles";

interface Props {
  genre: string;
  setGenre: (value: string) => void;
  labelid: string;
}

const genreName = [
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

const GenreSelect = ({ genre, setGenre, labelid }: Props): ReactElement => {
  const { formatMessage: _t } = useIntl();
  const classes = useFiltersStyles({});

  return (
    <Select
      labelId={labelid}
      defaultValue={genre}
      value={genre}
      onChange={(e: ChangeEvent<{ value: string }>): void =>
        setGenre(e.target.value)
      }
      className={classes.select}
    >
      <MenuItem value="all" id="menuitem-default">
        {_t({ id: "layout.filters.all" })}
      </MenuItem>

      {genreName.map((name) => (
        <MenuItem value={name} id={`menuitem-${name}`} key={name}>
          {_t({ id: `layout.filters.select_category.${name}` })}
        </MenuItem>
      ))}
    </Select>
  );
};

export default GenreSelect;
