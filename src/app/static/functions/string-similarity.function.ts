export function matchSortStringsToOneString(
  strings: string[],
  value: string,
  // oldSimilarityList: ISimilarityItem[],
): ISimilarityItem[] {
  const localColorSimilarityList: any = {};

  strings.forEach((str) => {
    const longer: string = value.length >= str.length ? value : str;
    const shorter: string = longer === value ? str : value;
    localColorSimilarityList[str] = similarity(longer, shorter);
  });

  const keys = Object.keys(localColorSimilarityList);
  for (let i = 0; i <= keys.length; i++) {
    const str = keys[i];
    const similarity = localColorSimilarityList[keys[i]];
    const obj: ISimilarityItem = {
      str,
      similarity,
    };
    localColorSimilarityList[keys[i]] = obj;
  }

  const sorted: ISimilarityItem[] = (
    Object.values(localColorSimilarityList) as ISimilarityItem[]
  )
    .sort(function (a: ISimilarityItem, b: ISimilarityItem) {
      if (a.similarity < b.similarity) {
        return -1;
      }
      if (a.similarity > b.similarity) {
        return 1;
      }
      return 0;
    })
    .reverse()
    .filter((obj: any) => obj.similarity > 0);
  // .slice(0, 5)
  // .sort(function (a: ISimilarityItem, b: ISimilarityItem) {
  //   if (a.code < b.code) {
  //     return -1;
  //   }
  //   if (a.code > b.code) {
  //     return 1;
  //   }
  //   return 0;
  // });

  // const inputCode: number = Number(value);
  // if (
  //   !Number.isNaN(value) &&
  //   inputCode >= 1 &&
  //   inputCode <= this.colorsInfo.length
  // ) {
  //   let codeIndex: number = -1;
  //   sorted.every((color: ISimilarityItem, index) => {
  //     if (inputCode === color.code) {
  //       codeIndex = index;
  //       return false;
  //     }

  //     return true;
  //   });
  //   if (codeIndex !== -1) {
  //     const firstColor = {
  //       code: sorted[0].code,
  //       similarity: sorted[0].similarity,
  //     };
  //     sorted[0] = sorted[codeIndex];
  //     sorted[codeIndex] = firstColor;
  //   }
  // }

  // let same: boolean = true;

  // sorted.every((item: ISimilarityItem, index: number) => {
  //   const oldItem = oldSimilarityList[index];

  //   if (item.similarity !== oldItem?.similarity || item.str !== oldItem?.str) {
  //     same = false;
  //     return false;
  //   }

  //   return true;
  // });

  // if (!same) {
  //   return sorted;
  // }

  // return [];

  return sorted;
}

export function similarity(s1: string, s2: string) {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength: number = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / Number(longerLength);

  function editDistance(s1: string, s2: string) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) {
        costs[s2.length] = lastValue;
      }
    }
    return costs[s2.length];
  }
}

export interface ISimilarityItem {
  str: string;
  similarity: number;
}
