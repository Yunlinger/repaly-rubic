// 理论考试 api

import request from '@/utils/request_rubik'

export const QUESTION_TYPE_SINGLE = 1
export const QUESTION_TYPE_MULTI = 2
export const QUESTION_TYPE_JUDGE = 3
export const QUESTION_TYPE_FILLBLANK = 4
export const QUESTION_TYPE_QA = 5

// 清空
// rpc ClearData(.google.protobuf.Empty) returns (.google.protobuf.Empty) {}
// bg.POST("/clearData", rpc.GenerateReflectionHandler("ExamService", "ClearData", true))
export function clearData() {
  return request({
    url: '/exam/clearData',
    method: 'post',
    data: {}
  })
}
// 章节管理
// rpc CreateMenu(Menu) returns (Menu) {}
// bg.POST("/menu/create", rpc.GenerateReflectionHandler("ExamService", "CreateMenu", true))
export function createMenu(menu) {
  return request({
    url: '/exam/menu/create',
    method: 'post',
    data: menu || {}
  })
}
// rpc UpdateMenu(Menu) returns (Menu) {}
// bg.POST("/menu/update", rpc.GenerateReflectionHandler("ExamService", "UpdateMenu", true))
export function updateMenu(menu) {
  return request({
    url: '/exam/menu/update',
    method: 'post',
    data: menu || {}
  })
}
// rpc ReadMenu(IdMessage) returns (QueryResult) {} // 获取 ID 下的所有子章节
// bg.POST("/menu/read", rpc.GenerateReflectionHandler("ExamService", "ReadMenu", true))
export function readMenu(id) {
  return request({
    url: '/exam/menu/read',
    method: 'post',
    data: { id }
  })
}
// rpc DeleteMenu(IdMessage) returns (.google.protobuf.Empty) {}
// bg.POST("/menu/delete", rpc.GenerateReflectionHandler("ExamService", "DeleteMenu", true))
export function deleteMenu(id) {
  return request({
    url: '/exam/menu/delete',
    method: 'post',
    data: { id }
  })
}

// 题库管理
// rpc CreateQuestion(Question) returns (Question) {}
// bg.POST("/question/create", rpc.GenerateReflectionHandler("ExamService", "CreateQuestion", true))
export function createQuestion(question) {
  return request({
    url: '/exam/question/create',
    method: 'post',
    data: question || {}
  })
}

// rpc UpdateQuestion(Question) returns (Question) {}
// bg.POST("/question/update", rpc.GenerateReflectionHandler("ExamService", "UpdateQuestion", true))
export function updateQuestion(question) {
  return request({
    url: '/exam/question/update',
    method: 'post',
    data: question || {}
  })
}

// rpc ReadQuestion(QueryFilter) returns (QueryResult) {}
// bg.POST("/question/read", rpc.GenerateReflectionHandler("ExamService", "ReadQuestion", true))
export function readQuestion(filter) {
  return request({
    url: '/exam/question/read',
    method: 'post',
    data: filter || {}
  })
}

// rpc DeleteQuestion(IdMessage) returns (.google.protobuf.Empty) {}
// bg.POST("/question/delete", rpc.GenerateReflectionHandler("ExamService", "DeleteQuestion", true))
export function deleteQuestion(id) {
  return request({
    url: '/exam/question/delete',
    method: 'post',
    data: { id }
  })
}

// 试卷管理
// rpc CreatePaper(Paper) returns (Paper) {}
// bg.POST("/paper/create", rpc.GenerateReflectionHandler("ExamService", "CreatePaper", true))
export function createPaper(paper) {
  return request({
    url: '/exam/paper/create',
    method: 'post',
    data: paper || {}
  })
}

// rpc UpdatePaper(Paper) returns (Paper) {}
// bg.POST("/paper/update", rpc.GenerateReflectionHandler("ExamService", "UpdatePaper", true))
export function updatePaper(paper) {
  return request({
    url: '/exam/paper/update',
    method: 'post',
    data: paper || {}
  })
}

// rpc ReadPaper(QueryFilter) returns (QueryResult) {}
// bg.POST("/paper/read", rpc.GenerateReflectionHandler("ExamService", "ReadPaper", true))
export function readPaper(filter) {
  return request({
    url: '/exam/paper/read',
    method: 'post',
    data: filter || {}
  })
}

// rpc DeletePaper(IdMessage) returns (.google.protobuf.Empty) {}
// bg.POST("/paper/delete", rpc.GenerateReflectionHandler("ExamService", "DeletePaper", true))
export function deletePaper(id) {
  return request({
    url: '/exam/paper/delete',
    method: 'post',
    data: { id }
  })
}

// rpc GeneratePaper(IdMessage) returns (.google.protobuf.Value) {}
// bg.POST("/paper/generate", rpc.GenerateReflectionHandler("ExamService", "GeneratePaper", true))
export function generatePaper(id) {
  return request({
    url: '/exam/paper/generate',
    method: 'post',
    data: { id }
  })
}

export function getPaperDetail(id) {
  return request({
    url: '/exam/paper/getDetail',
    method: 'post',
    data: { id }
  })
}

export function getExamDetail(id) {
  return request({
    url: '/exam/exam/detail',
    method: 'post',
    data: { id }
  })
}

// 大题管理
// rpc CreateTopic(Topic) returns (Topic) {}
// bg.POST("/topic/create", rpc.GenerateReflectionHandler("ExamService", "CreateTopic", true))
export function createTopic(topic) {
  return request({
    url: '/exam/topic/create',
    method: 'post',
    data: topic || {}
  })
}

// rpc UpdateTopic(Topic) returns (Topic) {}
// bg.POST("/topic/update", rpc.GenerateReflectionHandler("ExamService", "UpdateTopic", true))
export function updateTopic(topic) {
  return request({
    url: '/exam/topic/update',
    method: 'post',
    data: topic || {}
  })
}

// rpc ReadTopic(QueryFilter) returns (QueryResult) {}
// bg.POST("/topic/read", rpc.GenerateReflectionHandler("ExamService", "ReadTopic", true))
export function readTopic(filter) {
  return request({
    url: '/exam/topic/read',
    method: 'post',
    data: filter || {}
  })
}

// rpc DeleteTopic(IdMessage) returns (.google.protobuf.Empty) {}
// bg.POST("/topic/delete", rpc.GenerateReflectionHandler("ExamService", "DeleteTopic", true))
export function deleteTopic(id) {
  return request({
    url: '/exam/topic/delete',
    method: 'post',
    data: { id }
  })
}

// 大题中的小题管理, 当试卷状态为固定试卷时，可以进行以下操作。
// rpc AddQuestionToTopic(QuestionInTopic) returns (.google.protobuf.Empty) {}
// bg.POST("/topic/addQuestion", rpc.GenerateReflectionHandler("ExamService", "AddQuestionToTopic", true))
export function addQuestionToTopic(questionID, topicID) {
  return request({
    url: '/exam/topic/addQuestion',
    method: 'post',
    data: { questionID, topicID }
  })
}

// rpc RemoveQuestionFromTopic(QuestionInTopic) returns (.google.protobuf.Empty) {}
// bg.POST("/topic/removeQuestion", rpc.GenerateReflectionHandler("ExamService", "RemoveQuestionFromTopic", true))
export function removeQuestionFromTopic(questionID, topicID) {
  return request({
    url: '/exam/topic/removeQuestion',
    method: 'post',
    data: { questionID, topicID }
  })
}

// 考试管理
// 通过 Paper 的定义生成一次考试，建立大题快照和对应的小题快照，建立以后大题快照和小题快照不得修改。
// rpc CreateExam(Exam) returns (Exam) {}
// bg.POST("/exam/create", rpc.GenerateReflectionHandler("ExamService", "CreateExam", true))
export function createExam(exam) {
  return request({
    url: '/exam/exam/create',
    method: 'post',
    data: exam || {}
  })
}

// rpc UpdateExam(Exam) returns (Exam) {}
// bg.POST("/exam/update", rpc.GenerateReflectionHandler("ExamService", "UpdateExam", true))
export function updateExam(exam) {
  return request({
    url: '/exam/exam/update',
    method: 'post',
    data: exam || {}
  })
}

// rpc ReadExam(QueryFilter) returns (QueryResult) {}
// bg.POST("/exam/read", rpc.GenerateReflectionHandler("ExamService", "ReadExam", true))
export function readExam(filter) {
  return request({
    url: '/exam/exam/read',
    method: 'post',
    data: filter || {}
  })
}

// rpc DeleteExam(IdMessage) returns (.google.protobuf.Empty) {}
// bg.POST("/exam/delete", rpc.GenerateReflectionHandler("ExamService", "DeleteExam", true))
export function deleteExam(id) {
  return request({
    url: '/exam/exam/delete',
    method: 'post',
    data: { id }
  })
}

export function commitExam(data) {
  return request({
    url: '/exam/commitExam',
    method: 'post',
    data: data
  })
}

export function getCommitList(filter) {
  return request({
    url: '/exam/getcommitlist',
    method: 'post',
    data: filter || {}
  })
}

export function getExamAnswer(id) {
  return request({
    url: '/exam/getExamAnswer',
    method: 'post',
    data: { commitID: id }
  })
}

// 判卷、给分
export function judgeQuestion(examCommitID, questionSnapshotID, score) {
  return request({
    url: '/exam/judgeQuestion',
    method: 'post',
    data: { examCommitID, questionSnapshotID, score }
  })
}

// 练习卷
export function training(data) {
  return request({
    url: '/exam/paper/training',
    method: 'post',
    data
  })
}

// 试题固定
export function fixQuestion(data) {
  return request({
    url: '/exam/paper/fixquestion',
    method: 'post',
    data
  })
}

// 试题替换
export function replaceQuestion(data) {
  return request({
    url: '/exam/paper/replacequestion',
    method: 'post',
    data
  })
}

// 目录下试题数量
export function count(data) {
  return request({
    url: '/exam/question/count',
    method: 'post',
    data
  })
}

// 考试过程
// 考生开始考试。
// rpc BeginExam(BeginExamRequst) returns (.google.protobuf.Empty) {}
// bg.POST("/beginExam", rpc.GenerateReflectionHandler("ExamService", "BeginExam", true))
// 缓存考试答案，当考生有答案更改时，应该将答案做一个缓存保存到服务端
// rpc SetExamCache(ExamCache) returns (.google.protobuf.Empty) {}
// bg.POST("/setExamCache", rpc.GenerateReflectionHandler("ExamService", "SetExamCache", true))
// 当客户端出现故障（停电，计算机死机等）后重新登录参加考试， 应该从服务端获取考试答案缓存。
// rpc GetExamCache(GetExamCacheRequst) returns (ExamCache) {}
// bg.POST("/getExamCache", rpc.GenerateReflectionHandler("ExamService", "GetExamCache", true))
// 交卷
// rpc CommitExam(CommitExamRequst) returns (CommitExamResponse) {}
// bg.POST("/commitExam", rpc.GenerateReflectionHandler("ExamService", "CommitExam", true))

// 获取考试答案详细内容，用于老师判卷或者考生回看
// rpc GetExamAnswer(GetExamAnswerRequst) returns (ExamAnswerDetail) {}
// bg.POST("/getExamAnswer", rpc.GenerateReflectionHandler("ExamService", "GetExamAnswer", true))
// 判卷、给分
// rpc JudgeQuestion(JudgeQuestionRequst) returns(.google.protobuf.Empty) {}
// bg.POST("/judgeQuestion", rpc.GenerateReflectionHandler("ExamService", "JudgeQuestion", true))
// 老师对单题评语或者判卷解释
// rpc CommentQuestion(CommentQuestionRequest) returns(.google.protobuf.Empty) {}
// bg.POST("/commentQuestion", rpc.GenerateReflectionHandler("ExamService", "CommentQuestion", true))
// 老师对考试写评语
// rpc CommentExam(CommentExamRequest) returns(.google.protobuf.Empty) {}
// bg.POST("/commentExam", rpc.GenerateReflectionHandler("ExamService", "CommentExam", true))
// 考生对单题总结
// rpc SumupQuestion(SumupQuestionRequest) returns(.google.protobuf.Empty) {}
// bg.POST("/sumupQuestion", rpc.GenerateReflectionHandler("ExamService", "SumupQuestion", true))
// 考生对考试的总结
// rpc SumupExam(SumupExamRequest) returns(.google.protobuf.Empty) {}
// bg.POST("/sumupExam", rpc.GenerateReflectionHandler("ExamService", "SumupExam", true))
