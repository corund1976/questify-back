const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
  title: { type: String, required: [true, "Set name for ToDo(Quest) card"] },
  // ------------------------------
  // индексация для быстрого поиска
  // name: {type:String, index:1}
  // ------------------------------
  category: { type: String, enum: ["STUFF", "FAMILY", "HEALTH", "LEARNING", "LEISURE", "WORK"], default: "STUFF" },
  type: { type: String, enum: ["TASK", "CHALLENGE"], default: "TASK" },
  time: { type: Date },
  isActive: { type: Boolean, default: true }, // active / completed
  level: { type: String, enum: ["Easy", "Normal", "Hard"], default: "Easy" },
  owner: { type: Schema.Types.ObjectId, ref: "users" },
},
  { versionKey: false, timestamps: true }
);

const Todo = mongoose.model("todos", TodoSchema);

module.exports = Todo;
