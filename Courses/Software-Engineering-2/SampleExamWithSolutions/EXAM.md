# Instructions
1. Failing to observe any of the following rules results in a grade equal to 0 or, in some cases, you will be reported for fraud.
2. You are allowed to solve the exercises only by using the given monadic definitions and by composing/creating monads.
3. You cannot change any part of the given code except the parts marked with **PLACEHOLDER** that you have to complete.
4. During the exam you are allowed to open only your IDE with the provided exam template.
5. You must deliver your exam in Teams in the appropriate exam submission.
6. The code is set up so that it compiles but it might crash at runtime with the given placeholders. For this reason, the main function is commented out. Uncomment the various parts only if you have completed the appropriate section of the exam.

# Exam

## Exercise 1 (2 points)
Complete the missing parts from `mapStatefull`.

## Exercise 2 (1 point)
Complete the missing part from the function `exercise2` in `tiny-language-statefull.ts` so that the program will keep multiplying the variable `x` by 2 and increasing the variable `y` by 1 while `x` < `y`.

## Exercise 3 (2 points)
Complete the missing parts from `joinProcess`.

## Exercise 4 (1 point)
Complete the implementation of `getAllContent` in `server.ts` that, given a list of ips, will try use the function `tryGetData` to connect to each server and download the data (simulated). The data needs to be accumulated in the list in the state (suggestion: you can use `List.concat`).

## Exercise 5 (2 points)
Complete the missing parts from `mapCoroutine`

## Exercise 6 (2 points)
Complete the missing parts from `replaceWithDollar` so that the coroutine will wait until one of the entities has horizontal position `x = 5`. When this happens it will replace the symbol of such entities with `$`.