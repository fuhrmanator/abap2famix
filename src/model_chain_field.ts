import {ModelChain} from "./model_chain";
import {INode} from "abaplint/build/src//abap/nodes/_inode";
import {ModelClass} from "./model_class";
import {ArrowOrDash, ClassName, ComponentName, Field, FieldAll} from "abaplint/build/src//abap/expressions";
import {Access} from "famix/dist/model/famix/access";
import {FamixRepository} from "famix/dist/famix_repository";
import {ModelRepository} from "./model_repository";
import {Dash, InstanceArrow, StaticArrow} from "abaplint/build/src//abap/tokens";
import {ModelMethods} from "./model_methods";
import {Attribute} from "famix/dist/model/famix/attribute";

export class ModelFieldChain extends ModelChain {
  protected variable: Attribute;

  protected analyseNode(node: INode, currModelClass: ModelClass, isFirstElementInChain: boolean) {
    const expression = node.get();
    if ((expression instanceof Field) || (expression instanceof ComponentName) || (expression instanceof FieldAll)) {

      if (this.isFieldOfClass(node.getFirstToken().getStr(), currModelClass)) {
        this.addDebugInfo("class_field");
        this.variable = this.getFieldOfClass(node.getFirstToken().getStr(), currModelClass)!;

      } else if (isFirstElementInChain && (this.isParameterOfMethod(node))) {
        this.addDebugInfo("parameter");

      } else if (isFirstElementInChain && node.getFirstToken().getStr().toLowerCase().startsWith("l")) {
        this.addDebugInfo("local");

      } else {
        this.addDebugInfo("FIELD_NOT_FOUND");
      }
    } else if (expression instanceof ClassName) {
      const nextModelClass = ModelRepository.getRepo().getModelClass(node.getFirstToken().getStr());
      if (nextModelClass !== undefined) {
        this.addDebugInfo("class");
        currModelClass = nextModelClass;
      } else {
        this.addDebugInfo("CLASS_NOT_FOUND");
      }
    } else if ((expression instanceof Dash) || (expression instanceof InstanceArrow) || (expression instanceof StaticArrow)) {
      this.addDebugInfo(expression.getStr());
    } else if (expression instanceof ArrowOrDash) {
      this.addDebugInfo("=->");
    } else {
      this.addDebugInfo("[expression found!]");
    }
    return currModelClass;
  }

  protected addToModel(modelMethod: ModelMethods): void {
    if (this.variable) {
      this.addDebugInfo("  *");
      const famixAccess = new Access(FamixRepository.getFamixRepo());
      famixAccess.setAccessor(modelMethod.getFamixMethod());
      famixAccess.setVariable(this.variable);
    }
  }

}