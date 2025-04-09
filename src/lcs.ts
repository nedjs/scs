
function prepareLCS(str1: string, str2: string) {
    let n = str1.length, m = str2.length;
    let dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            if (str1[i] === str2[j]) {
                dp[i][j] = 1 + dp[i + 1][j + 1];
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    let x = 0, y = 0;
    let lcs = "";
    while (x < n && y < m) {
        if (str1[x] === str2[y]) {
            lcs += str1[x];
            x++;
            y++;
        } else if (dp[x + 1][y] >= dp[x][y + 1]) {
            x++;
        } else {
            y++;
        }
    }

    return {
        lcs,
        n,
        m,
    }
}

/**
 * Finds the shortest common supersequence of two strings. This is a known method of doing it
 * for 2 strings, used for validating results from the generic scs case.
 */
function scsLcsMethod(str1: string, str2: string) {
    const {lcs, n, m} = prepareLCS(str1, str2);
    let result = "";
    let x = 0;
    let y = 0;
    for (let c of lcs) {
        while (x < n && str1[x] !== c) result += str1[x++];
        while (y < m && str2[y] !== c) result += str2[y++];

        result += c;
        x++;
        y++;
    }

    result += str1.slice(x) + str2.slice(y);
    return result;
}

export {
    prepareLCS,
    scsLcsMethod
}