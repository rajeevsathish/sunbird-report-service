const { Op } = require('sequelize');

const aliasDefinitions = {
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in,
    $notIn: Op.notIn,
    $is: Op.is,
    $like: Op.like,
    $notLike: Op.notLike,
    $iLike: Op.iLike,
    $notILike: Op.notILike,
    $regexp: Op.regexp,
    $notRegexp: Op.notRegexp,
    $between: Op.between,
    $notBetween: Op.notBetween,
    $contains: Op.contains,
    $and: Op.and,
    $or: Op.or,
    $any: Op.any,
    $all: Op.all,
    $values: Op.values,
    $col: Op.col,
    $contained: Op.contained,
    $startsWith: Op.startsWith,
    $endsWith: Op.endsWith,
    $substring: Op.substring,
    $match: Op.match
}

module.exports = { aliasDefinitions }
