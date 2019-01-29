# Type\-safe LINQ in memory

In this project, you will build your own version of a LINQ\-style ORM in TypeScript with full\-blown type\-safety, and its translation into procedures over objects in memory. The final goal is to support, at the very least, the following operators\:
- `Select`;
- `Include`.

Optional operators (for a higher grade) are\:
- `Where`;
- `OrderBy`;
- `GroupBy`.

Your project will generate _a chain of executable functions_, in the lazy style.

## Code examples
An example of code could be the following\:

```typescript
students.Select("Name", "Surname").Include("Grades", q =>
  q.Select("Grade", "CourseId" )
)
```

We expect this code to make use of the `keyof` type operator, the _type homomorphism_, and in general the [advanced types of TypeScript](https://www.typescriptlang.org/docs/handbook/advanced-types.html). This implies that the code above will have type\:

```typescript
{
  Name:string,
  Surname:string,
  Grades:[
    {
      Grade:number,
      CourseId:number
    }
  ]
}
```

Writing an invalid query such as\:

```typescript
students.Select("Name", "Surname").Include("Grades", q =>
  q.Select("Grade", "Address" )
)
```

will produce a compiler error, because `Address` is not a valid field in the type definition of `Grade`.

## Evaluation criteria
The bare minimum (5.5) for this project is a type\safe implementation of `Select` and `Include`.

The `Where` operator alone will increase the grade by at most 2.5 points.

The remaining operators yield 1 point each.

### First presentation
The first presentation must showcase work for at least 3 points.
