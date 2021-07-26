import {UIService} from '../ui.service';
import {SchemeService} from './scheme.service';
import {Device_Item_Group, DIG_Param, DIG_Param_Type} from './scheme';
import {ChangeInfo, ChangeState, Structure_Type} from './settings/settings';

export function addParamsToDig(
    ui: UIService, schemeService: SchemeService,
    groupId: Device_Item_Group['id'], typeId: Device_Item_Group['type_id']
) {
    ui.confirmationDialog('Добавить все уставки из типа контура?') // TODO: i18n
        .subscribe((confirmation) => {
            if (!confirmation) return;

            addParamsToDigImpl(schemeService, groupId, typeId);
        });
}

export function addParamsToDigImpl(schemeService: SchemeService, groupId: Device_Item_Group['id'], typeId: Device_Item_Group['type_id']) {
    const paramTypes = schemeService.scheme.dig_param_type
        .filter((paramType) => paramType.group_type_id === typeId && !paramType.parent_id);
    let group: Device_Item_Group;
    for (let s of schemeService.scheme.section) {
        for (let g of s.groups) {
            if (g.id === groupId) {
                group = g;
                break;
            }
        }

        if (group) break;
    }

    const params = [];
    mapParamTypes(group, paramTypes, params);

    schemeService.modify_structure(Structure_Type.ST_DIG_PARAM, params)
        .subscribe(() => {});
}

function mapParamTypes(group: Device_Item_Group, paramTypes: DIG_Param_Type[], arr: ChangeInfo<DIG_Param>[] = []) {
    paramTypes.forEach((paramType) => {
        const param = new DIG_Param();
        param.param = paramType;
        param.param_id = paramType.id;
        param.group_id = group.id;
        param.childs = [];

        arr.push({
            obj: param,
            prev: null,
            state: ChangeState.Upsert,
        });

        if (paramType.childs) {
            mapParamTypes(group, paramType.childs, arr);
        }
    });
}
