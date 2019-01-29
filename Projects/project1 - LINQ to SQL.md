# LINQ to SQL

In this project, you will build your own version of a LINQ\-style ORM in C\#, and its translation into SQL. The final goal is to support, at the very least, the following operators\:
- `Select`;
- `Where`.

Optional operators (for a higher grade) are\:
- `Include`;
- `OrderBy`;
- `GroupBy`.

Your project will generate _a single SQL query_, for increased performance. Generating multiple queries might lower your grade.

## Code examples
An example of code could be the following\:

```c#
students.Select(s => new { s.Name, s.Surname }).Include(s => s.Grades, q => q.Select(g => new { g.Value, g.CourseId  }));
```

We expect this code to produce a single SQL query, and we expect *your code* to perform the following activities\:
- turn the query into an AST\;
- process the AST into SQL\;
- run the SQL\;
- deserialize the result of the SQL query into C\# objects.

## Evaluation criteria
The bare minimum (5.5) for this project is a query generator that creates a single SQL query and runs it correctly with at least the minimum operators specified above.

More operators will increase the grade by at most 2 points.

Deserialisation of the query result will yield the remaining 2.5 points.

### First presentation
The first presentation must showcase work for at least 3 points.
