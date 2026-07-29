"""
tools/calculator_tool.py
────────────────────────
Safe mathematical expression evaluator.
Uses Python's ast module to parse and evaluate arithmetic/math
expressions without exec/eval on arbitrary code.
"""

from __future__ import annotations

import ast
import math
import operator
from typing import Any

from tools.base_tool import BaseTool
from utils.logger import get_logger

log = get_logger(__name__)

# Allowed binary operators
_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
    ast.FloorDiv: operator.floordiv,
}

# Allowed unary operators
_UNARY = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}

# Allowed math functions
_FUNCTIONS = {
    "abs": abs, "round": round,
    "sqrt": math.sqrt, "log": math.log, "log2": math.log2, "log10": math.log10,
    "exp": math.exp, "ceil": math.ceil, "floor": math.floor,
    "sin": math.sin, "cos": math.cos, "tan": math.tan,
    "asin": math.asin, "acos": math.acos, "atan": math.atan,
    "pi": math.pi, "e": math.e, "inf": math.inf,
    "min": min, "max": max, "sum": sum,
}


def _safe_eval(node: ast.AST) -> float | int:
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError(f"Unsupported constant: {node.value!r}")

    if isinstance(node, ast.Name):
        if node.id in _FUNCTIONS:
            return _FUNCTIONS[node.id]  # type: ignore[return-value]
        raise ValueError(f"Unknown name: {node.id!r}")

    if isinstance(node, ast.BinOp):
        op_type = type(node.op)
        if op_type not in _OPERATORS:
            raise ValueError(f"Unsupported operator: {op_type.__name__}")
        left = _safe_eval(node.left)
        right = _safe_eval(node.right)
        return _OPERATORS[op_type](left, right)

    if isinstance(node, ast.UnaryOp):
        op_type = type(node.op)
        if op_type not in _UNARY:
            raise ValueError(f"Unsupported unary op: {op_type.__name__}")
        return _UNARY[op_type](_safe_eval(node.operand))

    if isinstance(node, ast.Call):
        if isinstance(node.func, ast.Name) and node.func.id in _FUNCTIONS:
            fn = _FUNCTIONS[node.func.id]
            args = [_safe_eval(a) for a in node.args]
            return fn(*args)  # type: ignore[operator]
        raise ValueError(f"Unsupported function call: {ast.dump(node.func)}")

    if isinstance(node, ast.Expression):
        return _safe_eval(node.body)

    raise ValueError(f"Unsupported AST node: {type(node).__name__}")


class CalculatorTool(BaseTool):
    """Evaluate safe mathematical expressions including trig, log, and basic arithmetic."""

    @property
    def name(self) -> str:
        return "calculator"

    @property
    def description(self) -> str:
        return (
            "Evaluate a mathematical expression. "
            "Supports +, -, *, /, **, %, floor division, and functions: "
            "sqrt, log, sin, cos, tan, abs, round, ceil, floor, exp, min, max."
        )

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "A mathematical expression, e.g. 'sqrt(2) * pi' or '(3 + 5) ** 2'.",
                },
            },
            "required": ["expression"],
        }

    async def _run(self, arguments: dict[str, Any]) -> Any:
        expression: str = arguments["expression"]

        try:
            tree = ast.parse(expression.strip(), mode="eval")
            result = _safe_eval(tree)
            return {
                "expression": expression,
                "result": result,
                "result_str": str(result),
            }
        except Exception as e:
            return {
                "expression": expression,
                "result": None,
                "error": str(e),
            }
