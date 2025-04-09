# SCS

A hopeful solution to [SCS](https://en.wikipedia.org/wiki/Shortest_common_supersequence_problem) for JS. To play
with it run `npm test`.

SO question is https://stackoverflow.com/questions/45269325/punch-combine-multiple-strings-into-a-single-shortest-possible-string-that-inc/45437800#

The code breaks the problem into two parts:

**1. Creating a linked graph between words** 

This is done by finding the longest common subsequence between each pair of words and linking the two. 
This solution for this is known for N=2 and can be found https://en.wikipedia.org/wiki/Longest_common_subsequence. 
In my case I grabbed an answer off of the internet somewhere. 

**2. Traversing the path through the graph**

This code is kinda wild but essentially we just walk each letter and find where it connects to
as we traverse we intelligently add or dont add letters depending on where we are.



## Usage

Lets be real noones adding this as a package, im not even bothering to publish it. See the tests for usage.


But if you were to use this as an npm package you would do something like this:

```javascript
const scs = require('scs')
const result = scs.scs(['moon', 'poor']);
console.log(result); // outputs "mpoonr"
console.log(scs.validate(result)); // outputs { valid: true, invalidWords: [] } 
```
