"use strict";
exports.__esModule = true;
// Nest
var runtime_1 = require("@prisma/client/runtime");
var common_1 = require("@nestjs/common");
// https://www.prisma.io/docs/reference/api-reference/error-reference
var error_codes = new Map([
    // too long value
    [
        'P2000',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        },
    ],
    // The record searched for in the where condition ({model_name}.{argument_name} = {argument_value}) does not exist
    [
        'P2001',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.NOT_FOUND);
        },
    ],
    // Unique constraint failed on the {constraint}
    [
        'P2002',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        },
    ],
    // Foreign key constraint failed on the field: {field_name}
    [
        'P2003',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        },
    ],
    // A constraint failed on the database: {database_error}
    [
        'P2004',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        },
    ],
    // The value {field_value} stored in the database for the field {field_name} is invalid for the field's type
    [
        'P2005',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.NOT_ACCEPTABLE);
        },
    ],
    // The provided value {field_value} for {model_name} field {field_name} is not valid
    [
        'P2006',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.NOT_ACCEPTABLE);
        },
    ],
    // Data validation error {database_error}
    [
        'P2007',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.CONFLICT);
        },
    ],
    // Failed to parse the query {query_parsing_error} at {query_position}
    [
        'P2008',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        },
    ],
    // Failed to validate the query: {query_validation_error} at {query_position}
    [
        'P2009',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.NOT_ACCEPTABLE);
        },
    ],
    // Raw query failed. Code: {code}. Message: {message}
    [
        'P2010',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        },
    ],
    // Null constraint violation on the {constraint}
    [
        'P2011',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.NOT_ACCEPTABLE);
        },
    ],
    // Missing a required value at {path}
    [
        'P2012',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        },
    ],
    // Missing the required argument {argument_name} for field {field_name} on {object_name}
    [
        'P2013',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        },
    ],
    // The change you are trying to make would violate the required relation '{relation_name}' between the {model_a_name} and {model_b_name} models
    [
        'P2014',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.FAILED_DEPENDENCY);
        },
    ],
    // A related record could not be found. {details}
    [
        'P2015',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        },
    ],
    // Query interpretation error. {details}
    [
        'P2016',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        },
    ],
    // The records for relation {relation_name} between the {parent_name} and {child_name} models are not connected.
    [
        'P2017',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        },
    ],
    // The required connected records were not found. {details}
    [
        'P2018',
        function (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        },
    ],
]);
function dispatch_prisma_error(error) {
    if (error_codes[error.code])
        error_codes[error.code](error);
    else
        throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
}
function dispatch_error(error) {
    if (error instanceof runtime_1.PrismaClientKnownRequestError)
        dispatch_prisma_error(error);
    else if (error instanceof common_1.HttpException)
        throw error;
    else
        throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
}
function error_dispatcher(error) {
    dispatch_error(error);
}
exports["default"] = error_dispatcher;
