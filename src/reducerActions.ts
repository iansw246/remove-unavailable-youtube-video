interface BaseAction {
    type: string;
}

interface Action<Name extends string, PayloadType> extends BaseAction {
    type: Name;
    payload: PayloadType;
}

function createAction<PayloadT, ActionT extends string>(typeName: ActionT): ((payload: PayloadT) => Action<ActionT, PayloadT>) & {match: (action: unknown) => action is Action<ActionT, PayloadT>} {
    const createFunction = (payload: PayloadT) => {
        return {
            type: typeName,
            payload: payload,
        };
    };

    createFunction.match = function matcher(action: any): action is Action<ActionT, PayloadT> {
        return (typeof action) === "object" && Object.hasOwn(action, "type") && action.type === typeName && Object.hasOwn(action, "payload");
    }

    return createFunction;
}

export { createAction }

export type { BaseAction, Action }