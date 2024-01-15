-- dummy testing data
use `EXAM_ENGINE`;

insert into `User` -- password: 123, ID: 1
values (default, "a.a", "a@a.com", 
        "$2y$10$TQHoRQPBBtStg.PrWJAcJeQORBDQoCCoBvRAitmiQLLE25rMCVTN.", "Admin",
        "Admin", default, default);

insert into `Document`
values (default, "Example exam", "exam", null, 1, null, default, 
        '[{"id":1,"ordinal":1,"title":"Are lemons yellow?","type":"trueFalse"},{"id":41,"ordinal":10,"title":"Which colors can apples have?","type":"multiChoice","answers":["green","yellow","orange","red","blue"]},{"id":2,"ordinal":2,"title":"Which color are lemons?","type":"shortAnswer","width":30},{"id":3,"ordinal":3,"title":"Which color are lemons?","type":"singleChoice","answers":["orange","yellow","beige"]},{"id":78,"ordinal":8,"title":"Which color are oranges?","type":"singleChoice","answers":["orange","yellow","green"]},{"id":4,"ordinal":4,"title":"Which colors lemons cannot have?","type":"multiChoice","answers":["green","yellow","orange","red"]},{"id":5,"ordinal":5,"title":"Explain what lemons are.","type":"longAnswer","size":[80,10]},{"id":11,"ordinal":-1,"title":"Fill in the following sentence:","type":"fillIn","partialText":"Lemon is a ‎ ‎.","answers":["yellow","fruit"]}]'
        ,null);
