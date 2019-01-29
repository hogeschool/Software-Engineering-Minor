# Type\-safe form builder

In this project, you will build a form\-builder in TypeScript with full\-blown type\-safety, and its translation into procedures in a frontend framework of your choice among React and Angular. The final goal is to support, at the very least, the following operators\:
- `Entity`;
- `Select`.

Optional operators (for a higher grade) are\:
- `Children`.

Your project will generate _the whole UX_, declaratively.

## Code examples
An example of code could be the following\:

```typescript
FormBuilder.Entity("Student", q =>
  q.Select("Name", "Surname").Children("Grades", q =>
    q.Select("Grade", "CourseId" )
  )
).Entity("Course", q =>
  q.Select("Name", "StudyPoints").Children("Lectures", q =>
    q.Select("Title", "Topic")
  )
)
```

We expect this code to make use of the `keyof` type operator, the _type homomorphism_, and in general the [advanced types of TypeScript](https://www.typescriptlang.org/docs/handbook/advanced-types.html). This implies that the code above will have type\:

```typescript
Renderer<{
  Student:[
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
  ],
  Course:[
    Name:string,
    StudyPoints:number,
    Lectures:[
      {
        Title:string,
        Topic:string
      }
    ]
  ]
>
```

Writing an invalid query such as\:

```typescript
FormBuilder.Entity("Student", q =>
  q.Select("Name", "Surname").Children("Grades", q =>
    q.Select("Grade", "CourseId" )
  )
).Entity("Course", q =>
  q.Select("Name", "StudyPoints").Children("Lectures", q =>
    q.Select("Title", "Topic", "EngineSize")
  )
)
```

will produce a compiler error, because `EngineSize` is not a valid field in the type definition of `Lecture`.

## Evaluation criteria
The bare minimum (5.5) for this project is a type\safe implementation of `Entity`, and `Select` and their associated renderers.

The `Children` operator alone will increase the grade by at most 2 points.

Building the framework in such a way as to be independent of React or Angular will yield 2.5 points.

### First presentation
The first presentation must showcase work for at least 3 points.
