import { useEffect, useState } from 'react';
import Axios from 'axios';

import { Fixture } from '../models/models';

const useApi = (
  url: string,
  fixture?: Fixture,
): {data: Record<string, unknown>; loading: boolean; error: {}} => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fixture) {
      setData(fixture.data);
      setLoading(fixture.loading);
      setError(fixture.error);
    } else {
      setLoading(true);
      setError(null);

      Axios.get(url)
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => {
          setError(err);
        }).finally(() => {
          setLoading(false);
        });
    }
  }, [fixture, url]);
  return { data, loading, error };
};

export default useApi;